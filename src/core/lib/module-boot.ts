import {Controller, RequestMapping, Injectable} from './decorator'
import {InjectionFactory, ModuleScanner} from './definition'

import Koa from "koa";
import Router from 'koa-router'

const moduleScanner = new ModuleScanner()

interface BootOpt {
    root: string
}

export class ModuleBoot {
    app: Koa
    modulesMap: object
    routerList: Router[]
    opt: BootOpt
    injectionFactory: InjectionFactory
    constructor(opt:BootOpt) {
        this.app = new Koa()
        this.opt = opt
        this.modulesMap = {}
        this.routerList = []
        this.injectionFactory = new InjectionFactory()
        this.onInit()
    }
    onInit() {
        let { root } = this.opt
        let paths = moduleScanner.searchModulePath(root)
        for (let i = 0; i < paths.length; i++) {
            let module = moduleScanner.moduleFilter(paths[i])
            module.forEach(item => {
                if (!this.modulesMap.hasOwnProperty(item.key)) {
                    this.modulesMap[item.key] = []
                }
                this.modulesMap[item.key].push(item.value)
            })
        }
        this.initInjection()
        this.initCtrl()
    }
    initInjection() {
        let injectModules = this.modulesMap[Injectable.symbol]
        if (!injectModules || injectModules.length < 0) return
        for (let i = 0; i < injectModules.length; i++) {
            this.injectionFactory.register(injectModules[i])
        }
    }
    initCtrl() {
        let ctrlModules = this.modulesMap[Controller.symbol]
        if (!ctrlModules || ctrlModules.length < 0) throw new Error('Not controller modules found')
        ctrlModules.forEach(Ctrl => {
            const router = new Router()
            const controller = this.injectionFactory.build(Ctrl)
            const metaData = Reflect.getMetadata('metaData', Ctrl.prototype)
            const prefix = metaData.getClassDecoratorValue(Controller)
            const methodMap = metaData.getMethodDecoratorValue(RequestMapping)
            for (const key in methodMap) {
                if (methodMap.hasOwnProperty(key)) {
                    const {method, path} = methodMap[key]
                    router[method](prefix + path,async function(ctx, next){
                        await controller[key].call(controller, ctx, next)
                    })
                }
            }
            this.routerList.push(router)
        })
        for (let i = 0; i < this.routerList.length; i++) {
            this.app.use(this.routerList[i].routes())
        }
    }
}

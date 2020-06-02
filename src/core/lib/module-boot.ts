import fs from 'fs'
import {join} from 'path'
import {Controller, RequestMapping, Injectable} from './decorator'
import {InjectionFactory} from './injection-factory'

import Koa from "koa";
import Router from 'koa-router'
const app = new Koa()

const moduleFilter:(path:string) => DecoratorModule[] = function(path: string) {
    let module = require(path)
    let moduleList = []
    for (const key in module) {
        if (module.hasOwnProperty(key) && typeof module[key] === 'function') {
            let metaData = Reflect.getMetadata('metaData', module[key].prototype)
            if (!metaData) continue
            let hasCtrlDecorator = metaData.getClassDecoratorValue(Controller)
            if (hasCtrlDecorator) {
                moduleList.push({
                    key: Controller.symbol,
                    value: module[key]
                })
            }
            let hasInjectableDecorator = metaData.getClassDecoratorValue(Injectable)
            if (hasInjectableDecorator) {
                moduleList.push({
                    key: Injectable.symbol,
                    value: module[key]
                })
            }
        }
    }
    return moduleList
}

interface DecoratorModule {
    key: string,
    value: Function
}

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
        this.app = app
        this.opt = opt
        this.modulesMap = {}
        this.routerList = []
        this.injectionFactory = new InjectionFactory()
        this.onInit()
    }
    onInit() {
        let { root } = this.opt
        let paths = this.searchModulePath(root)
        for (let i = 0; i < paths.length; i++) {
            let module = moduleFilter(paths[i])
            module.forEach(item => {
                if (!this.modulesMap.hasOwnProperty(item.key)) {
                    this.modulesMap[item.key] = []
                }
                this.modulesMap[item.key].push(item.value)
            })
        }
        this.initInjection()
        this.initMiddleWare()
        this.initCtrl()
    }
    initInjection() {
        let injectModules = this.modulesMap[Injectable.symbol]
        if (!injectModules || injectModules.length < 0) return
        for (let i = 0; i < injectModules.length; i++) {
            this.injectionFactory.register(injectModules[i])
        }
    }
    initMiddleWare() {

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
    searchModulePath(dir:string){
        let paths = []
        fs.readdirSync(dir).forEach(filename => {
            let path = join(dir, filename)
            let stat = fs.statSync(path)
            if (stat.isDirectory()) {
                let result = this.searchModulePath(path)
                return paths.push(...result)
            } else {
                if (!path.endsWith('.ts')) return
                paths.push(path)
            }
        })
        return paths
    }
}

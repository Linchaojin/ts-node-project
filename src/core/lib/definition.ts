import {Controller, inject, Injectable} from "./decorator"
import fs from "fs";
import {join} from "path";
import Application from "koa";

export class MetaData {
    classMetaData: object = {}
    methodMetaData: object = {}

    addClassMetaData(key: symbol, value: any) {
        if (!this.classMetaData.hasOwnProperty(key)) {
            this.classMetaData[key] = value
        } else {
            throw new Error('classMetaData has repeat key')
        }
    }

    getClassDecoratorValue(decorator) {
        if(decorator.symbol && typeof decorator.symbol === "symbol") {
            return this.classMetaData[decorator.symbol]
        }
        return null
    }

    getClassDecoratorMap() {
        return this.classMetaData
    }

    addMethodMetaData(key: symbol,methodName:string|symbol, value: any) {
        if (!this.methodMetaData.hasOwnProperty(key)) {
            this.methodMetaData[key] = {}
            this.methodMetaData[key][methodName] = value
        } else {
            let methodMap = this.methodMetaData[key]
            if (!methodMap.hasOwnProperty(methodName)) {
                this.methodMetaData[key][methodName] = value
            } else {
                throw new Error('methodMetaData has repeat key')
            }
        }
    }

    getMethodDecoratorValue(target) {
        if(target.symbol && typeof target.symbol === "symbol") {
            return this.methodMetaData[target.symbol]
        }
        return null
    }

    getMethodDecoratorMap() {
        return this.methodMetaData
    }
}

export class InjectionFactory {
    instanceMap: object
    middlewareMap: object
    constructor() {
        this.instanceMap = {}
        this.middlewareMap = {}
    }
    getInjectOption(prototype) {
        const metaData = Reflect.getMetadata('metaData', prototype)
        return metaData ? metaData.getClassDecoratorValue(Injectable) : null
    }
    register(provider) {
        if (typeof provider === "function") {
            const opt = this.getInjectOption(provider.prototype)
            if (opt) {
                const instance =  new provider()
                const key = opt.key
                if (typeof (instance as IMiddleWare).init === 'function') {
                    this.middlewareMap[key] = instance
                } else {
                    this.instanceMap[key] = instance
                }
            }
        }
    }
    injectMiddleWare(app:Application) {
        let ownKeys = Reflect.ownKeys(this.middlewareMap)
        for (let i = 0; i < ownKeys.length; i++) {
            const key = ownKeys[i]
            const instance = this.middlewareMap[key] as IMiddleWare
            instance.init(app)
        }
    }
    build(target:any) {
        const metaData = Reflect.getMetadata('metaData', target.prototype) as MetaData
        const providerMap =  metaData.getMethodDecoratorValue(inject)
        for (const propKey in providerMap) {
            if (providerMap.hasOwnProperty(propKey)) {
                let injectType = providerMap[propKey]
                let opt = this.getInjectOption(injectType.prototype)
                if (opt) {
                    Reflect.defineProperty(target.prototype, propKey, {
                        value: this.instanceMap[opt.key],
                        writable: true,
                        enumerable: true,
                        configurable: true
                    })
                }
            }
        }
        return new target()
    }
}

interface DecoratorModule {
    key: string,
    value: Function
}

export class ModuleScanner {
    moduleFilter(path:string): DecoratorModule[] {
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
    searchModulePath(dir:string):string[]{
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

export interface IMiddleWare {
    init(app: Application): void
}

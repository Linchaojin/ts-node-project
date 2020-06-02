import {inject, Injectable} from './decorator'

export class InjectionFactory {
    instanceMap: object
    constructor() {
        this.instanceMap = {}
    }
    getInjectSymbolKey(prototype) {
        const metaData = Reflect.getMetadata('metaData', prototype)
        return metaData ? metaData.getClassDecoratorValue(Injectable) : null
    }
    register(provider) {
        if (typeof provider === "function") {
            const symbol = this.getInjectSymbolKey(provider.prototype)
            if (symbol) {
                this.instanceMap[symbol] = new provider()
            }
        }
    }
    build(target) {
        const metaData = Reflect.getMetadata('metaData', target.prototype)
        const providerMap =  metaData.getMethodDecoratorValue(inject)
        for (const propKey in providerMap) {
            if (providerMap.hasOwnProperty(propKey)) {
                let injectType = providerMap[propKey]
                let symbol = this.getInjectSymbolKey(injectType.prototype)
                if (symbol) {
                    Reflect.defineProperty(target.prototype, propKey, {
                        value: this.instanceMap[symbol],
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

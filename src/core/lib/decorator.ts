import MetaData from "./meta-data";

const getMetaData: (target: object) => MetaData= function (target:object):MetaData {
    let meta = Reflect.getMetadata('metaData', target)
    if (!meta) {
        meta = new MetaData()
        Reflect.defineMetadata('metaData',meta,target)
    }
    return meta
}

export function Controller(prefix?:string):ClassDecorator {
    return function (target) {
        let metaData = getMetaData(target.prototype)
        metaData.addClassMetaData(Controller.symbol, prefix || true)
    }
}
Controller.symbol =  Symbol('Controller')


export enum RequestMethod { GET = 'get', POST = 'post',PUT = 'put',DELETE = 'delete'}

export function RequestMapping(path: string, method?:RequestMethod):MethodDecorator {
    if(!method) method = RequestMethod.GET
    return function (target, name, descriptor) {
        let metaData = getMetaData(target)
        metaData.addMethodMetaData(RequestMapping.symbol, name, {
            path,
            method
        })
        return descriptor
    }
}
RequestMapping.symbol =  Symbol('RequestMapping')

export function Injectable():ClassDecorator {
    return function (target) {
        let metaData = getMetaData(target.prototype)
        metaData.addClassMetaData(Injectable.symbol, Symbol(target.name))
    }
}
Injectable.symbol = Symbol('Injectable')


export function inject():PropertyDecorator {
    return function (target, name) {
        let provider = Reflect.getMetadata('design:type', target, name)
        let metaData = getMetaData(target)
        metaData.addMethodMetaData(inject.symbol, name, provider)
    }
}
inject.symbol = Symbol('inject')


export function MiddleWareFactory():ClassDecorator {
    return function (target) {
        let metaData = getMetaData(target.prototype)
        metaData.addClassMetaData(MiddleWareFactory.symbol, true)
    }
}
MiddleWareFactory.symbol = Symbol('MiddleWareFactory')

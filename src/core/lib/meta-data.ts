export default class MetaData {
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

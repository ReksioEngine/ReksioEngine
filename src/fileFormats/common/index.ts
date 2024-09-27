import {parseArgs} from '../../interpreter/evaluator'

export type FieldTypeParser = (object: any, key: string, param: string, value: string) => void

export const string = (object: any, key: string, param: string, value: string) => object[key] = value
export const number = (object: any, key: string, param: string, value: string) => {
    if (value.startsWith('"')) {
        object[key] = Number(value.slice(1,-1))
    } else {
        object[key] = Number(value)
    }
}
export const boolean = (object: any, key: string, param: string, value: string) => object[key] = value === 'TRUE'
export const stringArray = (object: any, key: string, param: string, value: string) => object[key] = value.split(',')
export const callback = (object: any, key: string, param: string, value: string) => object[key] = createCallback(value)

export const array = (valueParser: FieldTypeParser) => {
    return (object: any, key: string, param: string, value: string) => {
        const parts = value.split(',')

        if (!object[key]) {
            object[key] = new Array(parts.length)
        }

        for (const i in parts) {
            valueParser(object[key], i, '', parts[i])
        }
    }
}

export const map = (valueParser: FieldTypeParser) => {
    return (object: any, key: string, param: string, value: string) => {
        if (!object[key]) {
            object[key] = {}
        }
        valueParser(object[key], param, '', value)
    }
}

export const callbacks = <K>(object: any, key: string, param: string, value: string) => {
    if (!Object.prototype.hasOwnProperty.call(object, key)) {
        object[key] = {
            nonParametrized: null,
            parametrized: new Map<K, callback>()
        } as callbacks<K>
    }

    const callbackInstance = createCallback(value)
    if (param == undefined) {
        object[key].nonParametrized = callbackInstance
    } else {
        object[key].parametrized.set(param, callbackInstance)
    }
}

export const convertParam = (func: FieldTypeParser, modifier: (value: string) => any) => {
    return <K>(object: any, key: string, param: string, value: string) => {
        func(object, key, modifier(param), value)
    }
}

export const numberParam = (func: FieldTypeParser) => {
    return convertParam(func, (value => value !== undefined ? +value : value))
}

const createCallback = (value: string) => {
    if (value.startsWith('{')) {
        return {
            code: value.substring(1, value.length - 1),
            isSingleStatement: false
        }
    } else {
        const pattern = /(?<name>[a-zA-Z0-9_]+)(?:\((?<args>.*)\))?/g
        const argParsed = pattern.exec(value)

        const groups = argParsed?.groups
        if (groups) {
            const name = groups['name']
            const args = groups['args'] ? parseArgs(groups['args']) : []
            return {
                behaviourReference: name,
                constantArguments: args,
                isSingleStatement: false
            }
        }
    }
}

export const code = (object: any, key: string, param: string, value: string) => {
    object[key] = {
        code: value,
        isSingleStatement: true
    }
}

export const reference = (object: any, key: string, param: string, value: string) => {
    object[key] = {
        objectName: value
    }
}

export type callback = {
    behaviourReference?: string
    constantArguments: Array<any>
    code?: string
    isSingleStatement: boolean
}

export type callbacks<K> = {
    nonParametrized: callback | null
    parametrized: Map<K, callback>
}

export type reference = {
    objectName: string
}

export type TypeDefinition = {
    NAME: string
    TOINI: boolean
}

export type ValueTypeDefinition = TypeDefinition & {
    VALUE?: any
    DEFAULT?: any
}

export type DisplayTypeDefinition = TypeDefinition & {
    PRIORITY?: number
}
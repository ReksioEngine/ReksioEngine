import { parseArgs } from '../../interpreter/evaluator'
import { assert } from '../../errors'

type FieldTypeProcessor = (object: any, key: string, param: string, value: string) => any

export type FieldTypeEntry = {
    subType?: FieldTypeEntry
    flags?: {
        optional?: boolean
    }
    name: string
    processor: FieldTypeProcessor
}

export const optional = (subType: FieldTypeEntry) => ({
    ...subType,
    flags: {
        ...(subType.flags ?? {}),
        optional: true,
    },
})

export const string = {
    name: 'string',
    processor: (object: any, key: string, param: string, value: string) => {
        if (value === '""') {
            return ''
        }

        return value
    },
}

export const number = {
    name: 'number',
    processor: (object: any, key: string, param: string, value: string) => {
        const result = Number(value.startsWith('"') ? value.slice(1, -1) : value)
        assert(!isNaN(result), 'Value is not a number')
        return result
    },
}

export const boolean = {
    name: 'boolean',
    processor: (object: any, key: string, param: string, value: string) => {
        assert(value === 'TRUE' || value === 'FALSE', 'Expected TRUE or FALSE')
        return value === 'TRUE'
    },
}

export const callback = {
    name: 'callback',
    processor: (object: any, key: string, param: string, value: string) => {
        return createCallback(value)
    },
}

export const code = {
    name: 'code',
    processor: (object: any, key: string, param: string, value: string) => {
        return {
            code: value,
            isSingleStatement: true,
        }
    },
}

export const reference = {
    name: 'reference',
    processor: (object: any, key: string, param: string, value: string) => {
        return {
            objectName: value,
        }
    },
}

export const array = (subType: FieldTypeEntry) => ({
    subType,
    name: 'array',
    processor: (object: any, key: string, param: string, value: string) => {
        return value.split(',').map((part) => subType.processor(object, key, param, part))
    },
})

export const map = (subType: FieldTypeEntry) => ({
    subType,
    name: 'map',
    processor: (object: any, key: string, param: string, value: string) => {
        let result = object[key]
        if (result === undefined) {
            result = new Map()
        }

        result.set(param, subType.processor(object, key, param, value))
        return result
    },
})

export const callbacks = <K>(subType: FieldTypeEntry) => ({
    subType,
    name: 'callbacks',
    processor: <K>(object: any, key: string, param: string, value: string) => {
        let result = object[key]
        if (result === undefined) {
            result = {
                nonParametrized: null,
                parametrized: new Map<K, callback>(),
            } as callbacks<K>
        }

        const callbackInstance = createCallback(value)
        if (param == undefined) {
            result.nonParametrized = callbackInstance
        } else if (callbackInstance !== undefined) {
            result.parametrized.set(subType.processor(object, key, param, param), callbackInstance)
        }

        return result
    },
})

const createCallback = (value: string) => {
    if (value.startsWith('{')) {
        return {
            code: value.substring(1, value.length - 1),
            isSingleStatement: false,
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
                isSingleStatement: false,
            }
        }
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

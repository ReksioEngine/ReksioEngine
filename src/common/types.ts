import { assert, UnexpectedError } from './errors'
import { printStackTrace } from '../interpreter/script/stacktrace'

export const valueAsString = (value: any) => {
    if (value === null) {
        return 'NULL'
    }

    if (typeof value === 'string') {
        return value
    }

    if (value?.name) {
        return value.name
    }

    if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE'
    }

    assert(value !== undefined)
    assert(typeof value !== 'object')
    return value.toString()
}

export const valueAsBool = (value: any) => {
    if (value === null) {
        return false
    }

    if (typeof value === 'boolean') {
        return value
    }

    assert(value.toUpperCase() === 'TRUE' || value.toUpperCase() === 'FALSE')
    return value.toUpperCase() === 'TRUE'
}

const toNumber = (value: any) => {
    if (typeof value === 'number') {
        return value
    } else if (typeof value === 'string') {
        const match = value.match(/^-?\d+(\.\d+)?/)
        return match ? Number(match[0]) : 0
    } else {
        return Number(value)
    }
}

export const valueAsDouble = (value: any) => {
    if (value === null) {
        return 0
    }

    if (typeof value === 'number') {
        return value
    }

    const number = toNumber(value)
    assert(!Number.isNaN(number), 'Value is not a number')
    return number
}

export const ForceNumber = (value: any) => {
    const numberValue = toNumber(value)
    assert(!isNaN(numberValue), `${value} is not a number`)
    return numberValue
}

export const Compare = {
    Equal: (a: any, b: any) => {
        return valueAsString(a).toLowerCase() == valueAsString(b).toLowerCase()
    },
    NotEqual: (a: any, b: any) => {
        return valueAsString(a).toLowerCase() != valueAsString(b).toLowerCase()
    },
    Less: (a: any, b: any) => {
        return ForceNumber(a) < ForceNumber(b)
    },
    Greater: (a: any, b: any) => {
        return ForceNumber(a) > ForceNumber(b)
    },
    LessOrEqual: (a: any, b: any) => {
        return ForceNumber(a) <= ForceNumber(b)
    },
    GreaterOrEqual: (a: any, b: any) => {
        return ForceNumber(a) >= ForceNumber(b)
    },
}

const convertValue = (value: any, targetType: string) => {
    if (Array.isArray(value)) {
        const newArray = new Array(value.length)
        for (let i = 0; i < value.length; i++) {
            newArray[i] = convertValue(value[i], targetType)
        }
        return newArray
    }

    switch (targetType) {
        case 'string':
            return valueAsString(value)
        case 'boolean':
            return valueAsBool(value)
        case 'number':
            return valueAsDouble(value)
        default:
            return value
    }
}

export const isDirectlyConvertible = (value: any, type: parameterType) => {
    if (type.isArray !== Array.isArray(value)) {
        return false
    }

    if (type.isArray) {
        return value.every((entry: any) =>
            isDirectlyConvertible(entry, {
                name: type.name,
                literal: type.literal,
                isArray: false,
            })
        )
    }

    if (type.literal !== null) {
        return type.literal === convertValue(value, type.name)
    }

    switch (type.name) {
        case 'string':
            return true
        case 'boolean':
            return (
                typeof value === 'boolean' ||
                value === null ||
                value.toString().toUpperCase() === 'TRUE' ||
                value.toString().toUpperCase() === 'FALSE'
            )
        case 'number':
            return typeof value === 'number' ||
                value === null ||
                !Number.isNaN(toNumber(value))
        default:
            return false
    }
}

export type parameterType = {
    name: string
    literal: any
    isArray: boolean
}

export const compareType = (value: any, expectedType: parameterType) => {
    if (expectedType.name === 'any') {
        return true
    }

    if (expectedType.literal !== null) {
        return value === expectedType.literal
    }

    const type = typeof value
    const isArray = Array.isArray(value)
    return type === expectedType.name && isArray === expectedType.isArray
}

export type parameter = {
    name: string
    types: parameterType[]
    optional?: boolean
    rest?: boolean
}

export class InvalidMethodParameter extends UnexpectedError {}

export function method(...types: parameter[]) {
    return (originalMethod: any, context: any) => {
        function typeGuardWrapper(this: any, ...args: any[]) {
            const newArgs = [...args]

            let processedArgs = 0
            for (let i = 0; i < types.length; i++) {
                const argExpectedTypeInfo = types[i]
                const subArgsCount = argExpectedTypeInfo.rest ? args.length - i : 1
                processedArgs += subArgsCount

                for (let subArgIdx = i; subArgIdx < i + subArgsCount; subArgIdx++) {
                    const arg = args[subArgIdx]
                    const argRealType = typeof arg

                    if (arg === undefined) {
                        if (!argExpectedTypeInfo.optional) {
                            throw new InvalidMethodParameter(
                                `Non-optional argument "${argExpectedTypeInfo.name}" is undefined`
                            )
                        } else {
                            continue
                        }
                    }

                    const isExpectedType = argExpectedTypeInfo.types.some((type) => compareType(arg, type))
                    const isAnyAllowed = argExpectedTypeInfo.types.some((type) => type.name === 'any')
                    if (isExpectedType || isAnyAllowed) {
                        continue
                    }

                    const typesDisplayStrings = argExpectedTypeInfo.types.map(
                        (type) => `${type.name}${type.isArray ? '[]' : ''}`
                    )

                    // We only try to convert when the parameter accepts only one type
                    if (argExpectedTypeInfo.types.length === 1) {
                        const firstArgType = argExpectedTypeInfo.types[0]

                        if (!isDirectlyConvertible(arg, firstArgType)) {
                            throw new InvalidMethodParameter(
                                [
                                    `Function: ${originalMethod.name}`,
                                    `Type of argument "${argExpectedTypeInfo.name}" does not match the expected type`,
                                    `Expected: ${typesDisplayStrings[0]}`,
                                    `Received: ${argRealType}`,
                                ].join('\n')
                            )
                        }

                        const convertedValue = convertValue(args[subArgIdx], firstArgType.name)
                        if (firstArgType.literal !== null && firstArgType.literal !== convertedValue) {
                            throw new InvalidMethodParameter(
                                [
                                    `Function: ${originalMethod.name}`,
                                    `Argument "${arg}" does not match literal "${firstArgType.literal}"`,
                                ].join('\n')
                            )
                        }

                        newArgs[subArgIdx] = convertedValue
                        continue
                    }

                    // Otherwise we just check if it could be converted to any of the accepted types
                    const anyTypeMatches = argExpectedTypeInfo.types.some((type) => isDirectlyConvertible(arg, type))
                    if (!anyTypeMatches) {
                        throw new InvalidMethodParameter(
                            [
                                `Function: ${originalMethod.name}`,
                                `Type of argument "${argExpectedTypeInfo.name}" does not match any of the possible types`,
                                `Expected: ${typesDisplayStrings.join(' or ')}`,
                                `Received: ${argRealType}`,
                            ].join('\n')
                        )
                    }
                }
            }

            if (processedArgs < newArgs.length) {
                console.warn([
                    `Function: ${originalMethod.name}`,
                    `More arguments given than method accepts`
                ].join('\n'))
                printStackTrace()
            }

            return originalMethod.call(this, ...newArgs)
        }

        return typeGuardWrapper
    }
}

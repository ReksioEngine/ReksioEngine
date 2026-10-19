import { assert, UnexpectedError } from './errors'
import { logger } from '../engine/logging'
import { printStackTrace } from '../interpreter/stacktrace'
import { ValueType } from '../engine/types'
import { createBool, createDouble, createInteger, createString } from '../engine/types/values'
import { Double } from '../engine/types/double'
import { Expression } from '../engine/types/expression'

export const valueAsString = (value: any): string => {
    if (value === null) {
        return 'NULL'
    }

    if (typeof value === 'string') {
        return value
    }

    if (value?.name !== undefined) {
        return value.name
    }

    if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE'
    }

    assert(value !== undefined)
    assert(typeof value !== 'object')
    return value.toString()
}

export const doubleAsString = (value: number): string => {
    const abs = Math.abs(value)

    // Use fixed‑point for numbers below 1e21, otherwise fallback to bigint representation
    const fixed = abs < 1e21 ? abs.toFixed(5) : `${BigInt(abs)}.00000`
    const sign = value < 0 ? '-' : ''

    // Values with absolute magnitude >= 1
    if (!fixed.startsWith('0.')) {
        return sign + fixed
    }

    // Zero value
    if (value === 0) {
        return '00000'
    }

    // Values between 0 and 1 (exclusive)
    let leadingZeros = ''
    for (let v = value; v > 0 && v * 10.0001 < 1; v *= 10) {
        leadingZeros += '0'
    }

    const digits = fixed.slice(2).replace(/^0+/, '') || '0'
    return `0.${sign}${leadingZeros}${digits}`
}

export const valueAsBool = (value: any) => {
    if (value === null) {
        return false
    }

    if (typeof value === 'boolean') {
        return value
    }

    if (typeof value === 'number') {
        return value !== 0
    }

    return valueAsString(value).toUpperCase() === 'TRUE'
}

// Matches atof and atoi
const DOUBLE_PREFIX = /^\s*[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i
const INTEGER_PREFIX = /^\s*[+-]?\d+/

const parseLeadingNumber = (value: string, pattern: RegExp) => {
    const match = value.match(pattern)
    return match ? Number(match[0]) : 0
}

export const toNumber = (value: any) => {
    if (typeof value === 'number') {
        return value
    } else if (typeof value === 'string') {
        return parseLeadingNumber(value, DOUBLE_PREFIX)
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

export const valueAsInteger = (value: any) => {
    if (typeof value === 'string') {
        return parseLeadingNumber(value, INTEGER_PREFIX)
    }

    const newValue = valueAsDouble(value)
    return Math.trunc(newValue)
}

export const ForceNumber = (value: any) => {
    const numberValue = toNumber(value)
    assert(!isNaN(numberValue), `${value} is not a number`)
    return numberValue
}

export type PrimitiveKind = 'string' | 'boolean' | 'number'

export const looksLike = (value: any, kind: PrimitiveKind): boolean => {
    switch (kind) {
        case 'string':
            return true
        case 'boolean':
            return (
                typeof value === 'boolean' ||
                value === null ||
                value.toString().toUpperCase() === 'TRUE' ||
                value.toString().toUpperCase() === 'FALSE' ||
                value === 0 ||
                value === 1
            )
        case 'number':
            return typeof value !== 'string' || DOUBLE_PREFIX.test(value)
    }
}

export type parameterType = {
    name: string
}

export type parameter = {
    name: string
    types: parameterType[]
    optional?: boolean
    rest?: boolean
}

export class InvalidMethodParameter extends UnexpectedError {}

const isPrimitive = (value: any) => ['string', 'number', 'boolean'].includes(typeof value)

export type int = number
export type double = number

export type PrimitiveType = {
    kind: PrimitiveKind
    convert(value: any): any
}

export const primitiveTypes: Record<string, PrimitiveType> = {
    int: { kind: 'number', convert: valueAsInteger },
    double: { kind: 'number', convert: valueAsDouble },
    string: { kind: 'string', convert: valueAsString },
    boolean: { kind: 'boolean', convert: valueAsBool },
}

type Conversion = {
    index: number
    parameter: parameter
    types: PrimitiveType[]
}

export function method(types: parameter[] = [], returns?: string) {
    return (originalMethod: any, context: any) => {
        for (const parameter of types) {
            assert(
                parameter.types.every((type) => type.name !== 'number'),
                `${originalMethod.name}: declare "${parameter.name}" as int or double, not number`
            )
        }

        const convert = (conversion: Conversion, source: any, arg: any) => {
            const primitive = source instanceof ValueType ? source.getValue() : source
            if (typeof primitive === 'object' && primitive !== null) {
                throw new InvalidMethodParameter(
                    [
                        `Function: ${originalMethod.name}`,
                        `Type of argument "${conversion.parameter.name}" does not match the expected type`,
                        `Expected: ${conversion.parameter.types.map((type) => type.name).join(' or ')}`,
                        `Received: ${arg?.constructor?.name ?? typeof arg}`,
                    ].join('\n')
                )
            }
            if (conversion.types.length > 1 && primitive === null) {
                return null
            }
            const target =
                conversion.types.find((type) => type.kind === typeof primitive) ??
                conversion.types.find((type) => looksLike(primitive, type.kind)) ??
                conversion.types[0]

            if (target.kind === 'string' && source instanceof Double) {
                return doubleAsString(primitive)
            }
            return target.convert(primitive)
        }

        function typeGuardWrapper(this: any, ...args: any[]) {
            const conversions: Conversion[] = []
            let processedArgs = 0
            for (let i = 0; i < types.length; i++) {
                const parameter = types[i]
                const count = parameter.rest ? Math.max(args.length - i, 0) : 1
                processedArgs += count

                for (let index = i; index < i + count; index++) {
                    if (args[index] === undefined) {
                        if (!parameter.optional) {
                            throw new InvalidMethodParameter(`Non-optional argument "${parameter.name}" is undefined`)
                        }
                        continue
                    }

                    const declared = parameter.types.map((type) => primitiveTypes[type.name])
                    if (declared.every((type) => type !== undefined)) {
                        conversions.push({ index, parameter, types: declared })
                    }
                }
            }

            if (processedArgs < args.length) {
                logger.warn('More arguments given than method accepts', {
                    function: originalMethod.name,
                    processedArgs,
                    values: args,
                })
                printStackTrace()
            }

            const values = [...args]

            const call = (sources: any[]) => {
                conversions.forEach(
                    (conversion, i) =>
                        (values[conversion.index] = convert(conversion, sources[i], args[conversion.index]))
                )
                return originalMethod.call(this, ...values)
            }

            const read = (index: number) => (args[index] instanceof Expression ? args[index].evaluate() : args[index])

            const readRest = async (sources: any[], first: Promise<any>) => {
                sources.push(await first)
                for (const { index } of conversions.slice(sources.length)) {
                    sources.push(await read(index))
                }
                return call(sources)
            }

            const sources: any[] = []
            for (const { index } of conversions) {
                const source = read(index)
                if (source instanceof Promise) {
                    return readRest(sources, source)
                }
                sources.push(source)
            }
            return call(sources)
        }

        typeGuardWrapper.returns = returns
        return typeGuardWrapper
    }
}

const resultValue = (engine: any, returns: string, value: any) => {
    switch (returns) {
        case 'int':
            return createInteger(engine, value)
        case 'double':
            return createDouble(engine, value)
        case 'string':
            return createString(engine, value)
        case 'boolean':
            return createBool(engine, value)
    }
    throw new UnexpectedError(`Unknown return type: ${returns}`)
}

export const callMethod = (object: any, name: string, args: any[]) => {
    const target = object[name]
    const wrap = (result: any) =>
        target.returns !== undefined && isPrimitive(result) ? resultValue(object.engine, target.returns, result) : result

    const result = target.apply(object, args)
    return result instanceof Promise ? result.then(wrap) : wrap(result)
}

import { callMethod, InvalidMethodParameter, parameter, method, valueAsString } from './types'
import { TestEngine } from './testUtils'
import { createBool, createDouble, createInteger, createString } from '../engine/types/values'
import { Bool } from '../engine/types/bool'
import { Double } from '../engine/types/double'
import { Integer } from '../engine/types/integer'
import { String as CMCString } from '../engine/types/string'

const wasCalled = (result: string) => {
    expect(result).toBe('called')
    return result
}

describe('valueAsString', () => {
    test('string as string', () => {
        expect(valueAsString('test')).toBe('test')
    })

    test('numbers as string', () => {
        expect(valueAsString(1234)).toBe('1234')
        expect(valueAsString(1234.5)).toBe('1234.5')
    })

    test('boolean as string', () => {
        expect(valueAsString(true)).toBe('TRUE')
        expect(valueAsString(false)).toBe('FALSE')
    })

    test('null as string', () => {
        expect(valueAsString(null)).toBe('NULL')
    })

    test('undefined as string', () => {
        expect(() => valueAsString(undefined)).toThrow()
    })

    test('array as string', () => {
        expect(() => valueAsString([1, 2, 3, 4])).toThrow()
    })

    test('object as string', () => {
        expect(() => valueAsString(new Date())).toThrow()
    })
})

describe('test validator and conversion', () => {
    let engine: TestEngine

    beforeEach(() => {
        engine = new TestEngine()
    })

    const call = (wrapper: any, ...args: any[]) => wrapper.call({ engine: engine.asEngine() }, ...args)

    const simpleMethod = (type: string, expectedValue: any, optional = false) => {
        const parameters: parameter[] = [
            {
                name: 'arg1',
                optional: optional,
                types: [{ name: type }],
            },
        ]

        function testMethod(this: any, arg1: any) {
            expect(arg1).toBe(expectedValue)
            return 'called'
        }

        return method(parameters)(testMethod, null)
    }

    test('string as string', () => {
        wasCalled(call(simpleMethod('string', '1234'), createString(engine.asEngine(), '1234')))
    })

    test('primitive string as string', () => {
        wasCalled(call(simpleMethod('string', '1234'), '1234'))
    })

    test('boolean as string', () => {
        wasCalled(call(simpleMethod('string', 'TRUE'), createBool(engine.asEngine(), true)))
    })

    test('string as boolean', () => {
        wasCalled(call(simpleMethod('boolean', true), createString(engine.asEngine(), 'TRUE')))
    })

    test('integer as string', () => {
        wasCalled(call(simpleMethod('string', '1234'), createInteger(engine.asEngine(), 1234)))
    })

    test('double as string', () => {
        wasCalled(call(simpleMethod('string', '1234.5'), createDouble(engine.asEngine(), 1234.5)))
    })

    test('string as double', () => {
        wasCalled(call(simpleMethod('double', 5), createString(engine.asEngine(), '5')))
    })

    test('string as int', () => {
        wasCalled(call(simpleMethod('int', 5), createString(engine.asEngine(), '5.7')))
    })

    test('primitive number as double', () => {
        wasCalled(call(simpleMethod('double', 5), 5))
    })

    test('number array as string', () => {
        expect(() => call(simpleMethod('string', '1234'), [1, 2, 3, 4])).toThrow(InvalidMethodParameter)
    })

    test('optional parameter', () => {
        wasCalled(call(simpleMethod('string', '1234', true), createString(engine.asEngine(), '1234')))

        const parameters: parameter[] = [{ name: 'arg1', optional: true, types: [{ name: 'string' }] }]
        function testMethod(this: any, arg1: any) {
            expect(arg1).toBeUndefined()
            return 'called'
        }
        wasCalled(call(method(parameters)(testMethod, null)))
    })

    test('non-optional parameter', () => {
        expect(() => call(simpleMethod('string', '1234'))).toThrow(InvalidMethodParameter)
    })

    test('engine value for a parameter of another type is passed as it is', () => {
        const value = createInteger(engine.asEngine(), 5)
        wasCalled(call(simpleMethod('Value', value), value))
    })

    const simpleArrayMethod = (type: string, expectedValue: any) => {
        const parameters: parameter[] = [
            {
                name: 'arg1',
                types: [{ name: type }],
            },
        ]

        function testMethod(this: any, arg1: any) {
            expect(arg1).toStrictEqual(expectedValue)
            expect(Array.isArray(arg1)).toBeTruthy()
            return 'called'
        }

        return method(parameters)(testMethod, null)
    }

    test('array as Value', () => {
        wasCalled(call(simpleArrayMethod('Value', [1, 2, 3, 4]), [1, 2, 3, 4]))
    })

    test('array as any', () => {
        wasCalled(call(simpleArrayMethod('any', [1, '2', true, '4']), [1, '2', true, '4']))
    })

    test('array as double', () => {
        expect(() => call(simpleArrayMethod('double', [1, 2, 3, 4]), [1, 2, 3, 4])).toThrow(InvalidMethodParameter)
    })

    const simpleVariadicMethod = (type: string, variadicType: string, expectedValues: any[]) => {
        const parameters: parameter[] = [
            {
                name: 'arg1',
                types: [{ name: type }],
            },
            {
                name: 'arg2',
                types: [{ name: type }],
            },
            {
                name: 'arg3',
                rest: true,
                types: [{ name: variadicType }],
            },
        ]

        function testMethod(this: any, arg1: any, arg2: any, ...args: any[]) {
            expect(arg1).toBe(expectedValues[0])
            expect(arg2).toBe(expectedValues[1])
            expect(args).toStrictEqual(expectedValues[2])
            return 'called'
        }

        return method(parameters)(testMethod, null)
    }

    test('variadic function', () => {
        wasCalled(
            call(
                simpleVariadicMethod('string', 'double', ['a', 'b', [1, 2, 3, 4, 5, 6, 7, 8, 9]]),
                createString(engine.asEngine(), 'a'),
                createString(engine.asEngine(), 'b'),
                ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => createInteger(engine.asEngine(), value))
            )
        )
    })

    test('variadic parameter for numbers but strings passed', () => {
        wasCalled(
            call(
                simpleVariadicMethod('string', 'double', ['a', 'b', [1, 2, 3, 4, 5, 6, 7, 8, 9]]),
                createString(engine.asEngine(), 'a'),
                createString(engine.asEngine(), 'b'),
                ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((value) => createString(engine.asEngine(), value))
            )
        )
    })

    test('variadic parameter for numbers with partially messed types', () => {
        wasCalled(
            call(
                simpleVariadicMethod('string', 'double', ['a', 'b', [1, 2, 3, 4, 5, 6, 7, 8, 9]]),
                createString(engine.asEngine(), 'a'),
                createString(engine.asEngine(), 'b'),
                createInteger(engine.asEngine(), 1),
                createInteger(engine.asEngine(), 2),
                createInteger(engine.asEngine(), 3),
                createInteger(engine.asEngine(), 4),
                createString(engine.asEngine(), '5'),
                createString(engine.asEngine(), '6'),
                createInteger(engine.asEngine(), 7),
                createInteger(engine.asEngine(), 8),
                createInteger(engine.asEngine(), 9)
            )
        )
    })

    const primitiveMethod = (types: string[], expectedValue: any) => {
        function testMethod(this: any, arg1: any) {
            expect(arg1).toStrictEqual(expectedValue)
            return 'called'
        }
        return method([{ name: 'arg1', types: types.map((type) => ({ name: type })) }])(testMethod, null)
    }

    test('primitive parameters take converted primitives', () => {
        wasCalled(call(primitiveMethod(['double'], 5.5), createString(engine.asEngine(), '5.5')))
        wasCalled(call(primitiveMethod(['int'], 5), createDouble(engine.asEngine(), 5.7)))
        wasCalled(call(primitiveMethod(['string'], '1234'), createInteger(engine.asEngine(), 1234)))
        wasCalled(call(primitiveMethod(['boolean'], true), createString(engine.asEngine(), 'TRUE')))
    })

    test('union of primitives takes the primitive of the argument', () => {
        wasCalled(call(primitiveMethod(['string', 'double'], 5), createInteger(engine.asEngine(), 5)))
        wasCalled(call(primitiveMethod(['string', 'double'], '5'), createString(engine.asEngine(), '5')))
        wasCalled(call(primitiveMethod(['string', 'int'], 2), createDouble(engine.asEngine(), 2.5)))
    })

    test('union without the kind of the argument converts to the first type it fits', () => {
        wasCalled(call(primitiveMethod(['boolean', 'int'], false), createString(engine.asEngine(), 'FALSE')))
        wasCalled(call(primitiveMethod(['boolean', 'int'], 5), createString(engine.asEngine(), '5')))
    })

    test('union rejects a value no type fits', () => {
        expect(() => call(primitiveMethod(['string', 'double'], null), [1, 2, 3, 4])).toThrow(InvalidMethodParameter)
    })

    test('union of primitives passes NULL as null', () => {
        wasCalled(call(primitiveMethod(['string', 'double', 'boolean'], null), null))
    })

    test('number parameter is rejected', () => {
        expect(() => primitiveMethod(['number'], 5)).toThrow()
    })
})

describe('callMethod', () => {
    const engine = new TestEngine()

    const objectReturning = (returns: string | undefined, result: any) => ({
        engine: engine.asEngine(),
        METHOD: method([], returns)(() => result, null),
    })

    test('wraps a primitive result by the return type', async () => {
        expect(callMethod(objectReturning('int', 5), 'METHOD', [])).toBeInstanceOf(Integer)
        expect(callMethod(objectReturning('double', 5), 'METHOD', [])).toBeInstanceOf(Double)
        expect(callMethod(objectReturning('string', 'A'), 'METHOD', [])).toBeInstanceOf(CMCString)
        expect(await callMethod(objectReturning('boolean', Promise.resolve(true)), 'METHOD', [])).toBeInstanceOf(Bool)
    })

    test('passes null and results without a return type as they are', () => {
        expect(callMethod(objectReturning('int', null), 'METHOD', [])).toBeNull()
        expect(callMethod(objectReturning(undefined, 5), 'METHOD', [])).toBe(5)
    })

    test('a direct call returns the primitive', () => {
        expect(objectReturning('int', 5).METHOD()).toBe(5)
    })
})

import {InvalidMethodParameter, parameter, method, valueAsString} from './types'
import {UnexpectedError} from './errors'

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
        expect(() => valueAsString(undefined)).toThrow(UnexpectedError)
    })

    test('array as string', () => {
        expect(() => valueAsString([1,2,3,4])).toThrow(UnexpectedError)
    })

    test('object as string', () => {
        expect(() => valueAsString(new Date())).toThrow(UnexpectedError)
    })
})

describe('test validator and conversion', () => {
    const simpleMethod = (type: string, expectedValue?: any, optional=false) => {
        const parameters: parameter[] = [{
            name: 'arg1',
            optional: optional,
            types: [{name: type, literal: null, isArray: false}]
        }]

        function testMethod(this: any, arg1: any) {
            expect(typeof arg1 === type || (optional && arg1 === undefined)).toBeTruthy()
            expect(arg1).toBe(expectedValue)
            return 'called'
        }

        return method(...parameters)(testMethod, null)
    }

    test('string as string', () => {
        wasCalled(simpleMethod('string', '1234')('1234'))
    })

    test('boolean as string', () => {
        wasCalled(simpleMethod('string', 'TRUE')(true))
    })

    test('string as boolean', () => {
        wasCalled(simpleMethod('boolean', true)('TRUE'))
    })

    test('integer as string', () => {
        wasCalled(simpleMethod('string', '1234')(1234))
    })

    test('double as string', () => {
        wasCalled(simpleMethod('string', '1234.5')(1234.5))
    })

    test('number array as string', () => {
        expect(() => simpleMethod('string')([1,2,3,4])).toThrow(InvalidMethodParameter)
    })

    test('optional parameter', () => {
        wasCalled(simpleMethod('string', '1234', true)('1234'))
        wasCalled(simpleMethod('string', undefined, true)())
    })

    test('non-optional parameter', () => {
        expect(() => wasCalled(simpleMethod('string', undefined, false)())).toThrow(InvalidMethodParameter)
    })

    const simpleArrayMethod = (type: string, expectedValue?: any) => {
        const parameters: parameter[] = [{
            name: 'arg1',
            types: [{name: type, literal: null, isArray: true}]
        }]

        function testMethod(this: any, arg1: any) {
            expect(arg1).toStrictEqual(expectedValue)
            expect(Array.isArray(arg1)).toBeTruthy()
            return 'called'
        }

        return method(...parameters)(testMethod, null)
    }

    test('string array as number array', () => {
        wasCalled(simpleArrayMethod('number', [1,2,3,4])(['1','2','3','4']))
    })

    test('number array as string array', () => {
        wasCalled(simpleArrayMethod('string', ['1','2','3','4'])([1,2,3,4]))
    })

    test('array with any', () => {
        wasCalled(simpleArrayMethod('any', [1,'2',true,'4'])([1,'2',true,'4']))
    })

    test('number array with partially messed types', () => {
        wasCalled(simpleArrayMethod('number', [1,2,3,4])([1,2,'3',4]))
    })

    test('string array as boolean array', () => {
        wasCalled(simpleArrayMethod('boolean', [true,false,true,false])(['TRUE','FALSE','TRUE','FALSE']))
    })

    test('boolean array as string array', () => {
        wasCalled(simpleArrayMethod('string', ['TRUE','FALSE','TRUE','FALSE'])([true,false,true,false]))
    })

    const simpleVariadicMethod = (type: string, variadicType: string, expectedValues: any[]) => {
        const parameters: parameter[] = [
            {
                name: 'arg1',
                types: [{name: type, literal: null, isArray: false}]
            },
            {
                name: 'arg2',
                types: [{name: type, literal: null, isArray: false}]
            },
            {
                name: 'arg3',
                rest: true,
                types: [{name: variadicType, literal: null, isArray: false}]
            }
        ]

        function testMethod(this: any, arg1: string, arg2: string, ...args: any[]) {
            expect(arg1).toBe(expectedValues[0])
            expect(arg2).toBe(expectedValues[1])
            expect(Array.isArray(args)).toBeTruthy()
            expect(args).toStrictEqual(expectedValues[2])
            return 'called'
        }

        return method(...parameters)(testMethod, null)
    }

    test('variadic function', () => {
        wasCalled(simpleVariadicMethod('string', 'number', ['a','b',[1,2,3,4,5,6,7,8,9]])('a','b',1,2,3,4,5,6,7,8,9))
    })

    test('variadic parameter for numbers but strings passed', () => {
        wasCalled(simpleVariadicMethod('string', 'number', ['a','b',[1,2,3,4,5,6,7,8,9]])('a','b','1','2','3','4','5','6','7','8','9'))
    })

    test('variadic parameter for numbers with partially messed types', () => {
        wasCalled(simpleVariadicMethod('string', 'number', ['a','b',[1,2,3,4,5,6,7,8,9]])('a','b',1,2,3,4,'5','6',7,8,9))
    })

    const simpleLiteralMethod = (literals: string[]) => {
        const parameters: parameter[] = [
            {
                name: 'arg1',
                types: literals.map(literal => ({name: 'string', literal: literal, isArray: false}))
            }
        ]

        function testMethod(this: any, arg1: string) {
            return 'called'
        }

        return method(...parameters)(testMethod, null)
    }

    test('string literal', () => {
        wasCalled(simpleLiteralMethod(['TEST', 'DUPA'])('DUPA'))
        expect(() => wasCalled(simpleLiteralMethod(['TEST', 'DUPA'])('DUPA2'))).toThrow(InvalidMethodParameter)
    })
})

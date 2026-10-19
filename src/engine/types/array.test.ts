import { TestEngine } from '../../common/testUtils'
import { ArrayObject } from './array'
import { Double } from './double'
import { Integer } from './integer'
import { Expression } from './expression'
import { createString } from './values'

describe('ARRAY', () => {
    let engine: TestEngine
    let array: ArrayObject

    beforeEach(() => {
        engine = new TestEngine()
        array = engine.add(
            new ArrayObject(engine.asEngine(), engine.currentScene, { TYPE: 'ARRAY', NAME: 'ARR' } as any)
        )
    })

    test('ADD stores a copy of the variable', async () => {
        engine.integer('A', 1)
        await engine.run('ARR^ADD(A);A^SET(2);')
        expect(array.getValue().map((element) => element?.getValue())).toEqual([1])
    })

    test('NULL is stored and returned as null', async () => {
        const s = engine.string('S')
        // A method without a result gives null
        await engine.run('ARR^ADD(ARR^MSGBOX());S^SET(ARR^GET(0));')
        expect(array.getValue()).toEqual([null])
        expect(await array.FIND(createString(engine.asEngine(), 'NULL'))).toBe(0)
        expect(s.getValue()).toBe('NULL')
    })

    test('elements keep their type', async () => {
        engine.double('D', 2)
        await engine.run('ARR^ADD(D);')
        expect(array.getValue()[0]).toBeInstanceOf(Double)
    })

    test('an EXPRESSION keeps the type of its result', async () => {
        engine.double('D', 2)
        engine.add(
            new Expression(engine.asEngine(), engine.currentScene, {
                TYPE: 'EXPRESSION',
                NAME: 'E',
                OPERAND1: { code: 'D', isSingleStatement: true },
                OPERATOR: 'ADD',
                OPERAND2: { code: '1', isSingleStatement: true },
            } as any)
        )
        await engine.run('ARR^ADD(E);')
        expect(array.getValue()[0]).toBeInstanceOf(Double)
        expect(array.getValue()[0]?.getValue()).toBe(3)
    })

    const find = async (method: 'FIND' | 'REVERSEFIND', value: string) => {
        const i = engine.integer('I')
        await engine.run(`I^SET(ARR^${method}(${value}));`)
        return i.getValue()
    }

    test('FIND compares strings ignoring case', async () => {
        await engine.run('ARR^ADD(5, "abc");')
        expect(await find('FIND', '"5"')).toBe(0)
        expect(await find('FIND', '"ABC"')).toBe(1)
        expect(await find('FIND', '"x"')).toBe(-1)
    })

    test('FIND compares in the type of the element', async () => {
        await engine.run('ARR^ADD(2, 2.4, "2");')
        // The INTEGER 2 truncates 2.4
        expect(await find('FIND', '2.4')).toBe(0)
        // The DOUBLE 2.4 is not 2, the STRING "2" is not "2.00000"
        expect(await find('REVERSEFIND', '2.0')).toBe(0)
        // Any number other than 0 is TRUE
        await engine.run('ARR^ADD(TRUE);')
        expect(await find('REVERSEFIND', '5')).toBe(3)
    })

    test('CONTAINS compares in the type of the element, like FIND', async () => {
        const contains = async (value: string) => {
            const b = engine.boolean('B')
            await engine.run(`B^SET(ARR^CONTAINS(${value}));`)
            return b.getValue()
        }
        await engine.run('ARR^ADD("5", 2);')
        expect(await contains('5')).toBe(true)
        expect(await contains('2.4')).toBe(true)
        expect(await contains('"6"')).toBe(false)
    })

    test('REVERSEFIND searches from the end', async () => {
        await engine.run('ARR^ADD(5, 5, "5");')
        expect(await find('REVERSEFIND', '5')).toBe(2)
        expect(await find('REVERSEFIND', '"5"')).toBe(2)
        expect(await find('REVERSEFIND', '7')).toBe(-1)
    })

    test('INTEGER elements truncate the value before the operation', async () => {
        await engine.run('ARR^ADD(10, 10.0, 7);ARR^MULAT(0, 1.5);ARR^MULAT(1, 1.5);ARR^CLAMPAT(2, 0, 2.9);')
        expect(array.getValue().map((element) => element?.constructor)).toEqual([Integer, Double, Integer])
        expect(array.getValue().map((element) => element?.getValue())).toEqual([10, 15, 2])
    })

    test('ADDAT keeps the type of the element', async () => {
        await engine.run('ARR^ADD(5);ARR^ADDAT(0, 1.5);')
        expect(array.getValue()[0]).toBeInstanceOf(Integer)
        expect(array.getValue()[0]?.getValue()).toBe(6)
    })
})

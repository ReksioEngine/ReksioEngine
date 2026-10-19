import { TestEngine } from '../../common/testUtils'
import { ArrayObject } from './array'
import { Double } from './double'
import { Integer } from './integer'
import { Expression } from './expression'

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
        expect(array.FIND('NULL')).toBe(0)
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

    test('FIND compares as strings, ignoring case', async () => {
        await engine.run('ARR^ADD(5, "abc");')
        expect(array.FIND('5')).toBe(0)
        expect(array.FIND('ABC')).toBe(1)
        expect(array.FIND('x')).toBe(-1)
    })

    test('CONTAINS matches the value or its string', async () => {
        await engine.run('ARR^ADD("5", TRUE);')
        expect(array.CONTAINS(5)).toBe(true)
        expect(array.CONTAINS(true)).toBe(true)
        expect(array.CONTAINS('6')).toBe(false)
    })

    test('REVERSEFIND compares as strings, from the end', async () => {
        await engine.run('ARR^ADD(5, 5, "5");')
        expect(array.REVERSEFIND(5)).toBe(2)
        expect(array.REVERSEFIND('5')).toBe(2)
        expect(array.REVERSEFIND(7)).toBe(-1)
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

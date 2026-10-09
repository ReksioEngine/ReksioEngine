import { TestEngine } from './testUtils'
import { logger } from '../engine/logging'

describe('interpreter', () => {
    let engine: TestEngine

    beforeEach(() => {
        engine = new TestEngine()
        jest.spyOn(console, 'error').mockImplementation(() => {})
        jest.spyOn((logger as any).severityMapping, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('method call with literal argument', async () => {
        const a = engine.integer('A')
        await engine.run('A^SET(5);')
        expect(await a.getValue()).toBe(5)
    })

    test('method arguments are converted to declared types', async () => {
        const a = engine.integer('A', 1)
        await engine.run('A^ADD("5");')
        expect(await a.getValue()).toBe(6)
    })

    test('bracket expression is evaluated left to right', async () => {
        const a = engine.integer('A', 2)
        await engine.run('A^SET([A+1*3]);')
        expect(await a.getValue()).toBe(9)
    })

    test('nested method call as argument', async () => {
        const a = engine.integer('A', 4)
        const b = engine.integer('B')
        await engine.run('B^SET(A^GET());')
        expect(await b.getValue()).toBe(4)
    })

    test('indirect object reference', async () => {
        const a = engine.integer('A')
        engine.string('REF', 'A')
        await engine.run('*REF^SET(3);')
        expect(await a.getValue()).toBe(3)
    })

    test('script arguments substitution', async () => {
        const a = engine.integer('A')
        await engine.run('A^SET($1);A^ADD($2);', [2, 3])
        expect(await a.getValue()).toBe(5)
    })

    test('@IF runs matching branch', async () => {
        const s = engine.string('S')
        engine.behaviour('ONTRUE', '{S^SET("T");}')
        engine.behaviour('ONFALSE', '{S^SET("F");}')

        await engine.run('@IF("1","_","1","ONTRUE","ONFALSE");')
        expect(await s.getValue()).toBe('T')

        await engine.run('@IF("1","_","2","ONTRUE","ONFALSE");')
        expect(await s.getValue()).toBe('F')
    })

    test('@LOOP exposes _I_ counter', async () => {
        const s = engine.string('S')
        engine.behaviour('BODY', '{S^ADD(_I_);}')
        await engine.run('@LOOP("BODY",0,3,1);')
        expect(await s.getValue()).toBe('012')
    })

    test('@BREAK stops @LOOP', async () => {
        const a = engine.integer('A')
        engine.behaviour('BODY', '{A^INC();@BREAK();A^INC();}')
        await engine.run('@LOOP("BODY",0,3,1);')
        expect(await a.getValue()).toBe(1)
    })

    test('@WHILE runs until condition fails', async () => {
        const a = engine.integer('A')
        engine.behaviour('BODY', '{A^INC();}')
        await engine.run('@WHILE("A","<","3","BODY");')
        expect(await a.getValue()).toBe(3)
    })

    test('@RETURN returns value from behavior', async () => {
        const a = engine.integer('A')
        engine.behaviour('BODY', '{@RETURN(1234);}')
        await engine.run('A^SET(BODY^RUN());')
        expect(await a.getValue()).toBe(1234)
    })

    test('last result is not used as behavior return value', async () => {
        const a = engine.integer('A')
        engine.behaviour('BODY', '{A^ADD(1234);}')
        await engine.run('A^SET(BODY^RUN());')
        expect(await a.getValue()).toBe(0)
    })

    test('call on missing object is skipped', async () => {
        const a = engine.integer('A')
        await engine.run('MISSING^SET(1);A^SET(2);')
        expect(await a.getValue()).toBe(2)
    })
})

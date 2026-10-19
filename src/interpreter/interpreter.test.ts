import { TestEngine } from '../common/testUtils'
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
        expect(a.getValue()).toBe(5)
    })

    test('method arguments are converted to declared types', async () => {
        const a = engine.integer('A', 1)
        await engine.run('A^ADD("5");')
        expect(a.getValue()).toBe(6)
    })

    test('bracket expression is evaluated left to right', async () => {
        const a = engine.integer('A', 2)
        await engine.run('A^SET([A+1*3]);')
        expect(a.getValue()).toBe(9)
    })

    test('nested method call as argument', async () => {
        const a = engine.integer('A', 4)
        const b = engine.integer('B')
        await engine.run('B^SET(A^GET());')
        expect(b.getValue()).toBe(4)
    })

    test('indirect object reference', async () => {
        const a = engine.integer('A')
        engine.string('REF', 'A')
        await engine.run('*REF^SET(3);')
        expect(a.getValue()).toBe(3)
    })

    test('script arguments substitution', async () => {
        const a = engine.integer('A')
        await engine.run('A^SET($1);A^ADD($2);', [2, 3])
        expect(a.getValue()).toBe(5)
    })

    test('@IF runs matching branch', async () => {
        const s = engine.string('S')
        engine.behaviour('ONTRUE', '{S^SET("T");}')
        engine.behaviour('ONFALSE', '{S^SET("F");}')

        await engine.run('@IF("1","_","1","ONTRUE","ONFALSE");')
        expect(s.getValue()).toBe('T')

        await engine.run('@IF("1","_","2","ONTRUE","ONFALSE");')
        expect(s.getValue()).toBe('F')
    })

    test('@LOOP exposes _I_ counter', async () => {
        const s = engine.string('S')
        engine.behaviour('BODY', '{S^ADD(_I_);}')
        await engine.run('@LOOP("BODY",0,3,1);')
        expect(s.getValue()).toBe('012')
    })

    test('SCENE^RUN returns a primitive result as an engine value', async () => {
        engine.string('S', 'ABC')
        const n = engine.integer('N')
        await engine.run('N^SET(SCENE^RUN("S", "LENGTH"));')
        expect(n.getValue()).toBe(3)
    })

    test('RUNLOOPED passes the counter as an INTEGER, like @LOOP', async () => {
        const s = engine.string('S')
        engine.behaviour('BODY', '{S^ADD($1);}')
        await engine.run('BODY^RUNLOOPED(0,3);')
        expect(s.getValue()).toBe('012')
    })

    test('@BREAK stops @LOOP', async () => {
        const a = engine.integer('A')
        engine.behaviour('BODY', '{A^INC();@BREAK();A^INC();}')
        await engine.run('@LOOP("BODY",0,3,1);')
        expect(a.getValue()).toBe(1)
    })

    test('@WHILE runs until condition fails', async () => {
        const a = engine.integer('A')
        engine.behaviour('BODY', '{A^INC();}')
        await engine.run('@WHILE("A","<","3","BODY");')
        expect(a.getValue()).toBe(3)
    })

    test('@RETURN returns value from behavior', async () => {
        const a = engine.integer('A')
        engine.behaviour('BODY', '{@RETURN(1234);}')
        await engine.run('A^SET(BODY^RUN());')
        expect(a.getValue()).toBe(1234)
    })

    test('last result is not used as behavior return value', async () => {
        const a = engine.integer('A')
        const b = engine.integer('B')
        engine.behaviour('BODY', '{A^ADD(1234);}')
        await engine.run('B^SET(BODY^RUN());')
        expect(a.getValue()).toBe(1234)
        expect(b.getValue()).toBe(0)
    })

    test('call on missing object is skipped', async () => {
        const a = engine.integer('A')
        await engine.run('MISSING^SET(1);A^SET(2);')
        expect(a.getValue()).toBe(2)
    })

    test('inline code behavior in @IF', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF("1","_","1","{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('value references', async () => {
        const a = engine.boolean('VALUE1')
        const b = engine.boolean('VALUE2')
        await engine.run('VALUE1^SET(TRUE);VALUE2^SET(VALUE1);')
        expect(a.getValue()).toBe(true)
        expect(b.getValue()).toBe(true)
    })

    test('unknown value reference becomes a string', async () => {
        const a = engine.string('VALUE')
        await engine.run('VALUE^SET(TEST);')
        expect(a.getValue()).toBe('TEST')
    })

    test('0 == NULL', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(0,"_",NULL,"{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('5 == "5A"', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(5,"_","5A","{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('52 == "5 2"', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(52,"_","5 2","{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('5 == "5a51"', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(5,"_","5a51","{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('52 == 52.3', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(52,"_",52.3,"{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('52.3 != 52', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(52.3,"!_",52,"{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('NULL != 0', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(NULL,"_",0,"{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(false)
    })

    test('0.0 == NULL', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(0.0,"_",NULL,"{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('0 == "NULL"', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(0,"_","NULL","{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('NULL == "NULL"', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(NULL,"_","NULL","{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('"abc" == "ABC"', async () => {
        const a = engine.boolean('VALUE')
        const s = engine.string('S', 'abc')
        await engine.run('@IF(S,"_","ABC","{VALUE^SET(TRUE);}","");')
        expect(s.getValue()).toBe('abc')
        expect(a.getValue()).toBe(true)
    })

    test('0 == "A"', async () => {
        const a = engine.boolean('VALUE')
        await engine.run('@IF(0,"_","A","{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('0+6.5 == 6.0', async () => {
        const a = engine.double('VALUE')
        await engine.run('VALUE^SET([0+6.5]);')
        expect(a.getValue()).toBe(6)
    })

    test('0.0+6.5 == 6.5', async () => {
        const a = engine.double('VALUE')
        await engine.run('VALUE^SET([0.0+6.5]);')
        expect(a.getValue()).toBe(6.5)
    })

    test('6.5+TRUE == 7.5', async () => {
        const a = engine.double('VALUE')
        await engine.run('VALUE^SET([6.5+TRUE]);')
        expect(a.getValue()).toBe(7.5)
    })

    test('TRUE+6.5 == 1', async () => {
        const a = engine.double('VALUE')
        await engine.run('VALUE^SET([TRUE+6.5]);')
        expect(a.getValue()).toBe(1)
    })

    test('FALSE+1 == 0', async () => {
        const a = engine.integer('VALUE')
        await engine.run('VALUE^SET([FALSE+1]);')
        expect(a.getValue()).toBe(0)
    })

    test('FALSE+FALSE == 0', async () => {
        const a = engine.integer('VALUE')
        await engine.run('VALUE^SET([FALSE+FALSE]);')
        expect(a.getValue()).toBe(0)
    })

    test('TRUE+FALSE == 0', async () => {
        const a = engine.integer('VALUE')
        await engine.run('VALUE^SET([TRUE+FALSE]);')
        expect(a.getValue()).toBe(0)
    })

    test('FALSE+TRUE == 0', async () => {
        const a = engine.integer('VALUE')
        await engine.run('VALUE^SET([FALSE+TRUE]);')
        expect(a.getValue()).toBe(0)
    })

    test('DOUBLE^GET keeps a whole number a double', async () => {
        engine.double('D', 6)
        const a = engine.double('VALUE')
        await engine.run('VALUE^SET([D^GET()+0.5]);')
        expect(a.getValue()).toBe(6.5)
    })

    test('DOUBLE^GET compares as a double', async () => {
        engine.double('D', 6.5)
        const a = engine.boolean('VALUE')
        await engine.run('@IF(D^GET(),"_",6.5,"{VALUE^SET(TRUE);}","");')
        expect(a.getValue()).toBe(true)
    })

    test('STRING^LENGTH in arithmetic', async () => {
        engine.string('S', 'abc')
        const a = engine.integer('VALUE')
        await engine.run('VALUE^SET([S^LENGTH()+1]);')
        expect(a.getValue()).toBe(4)
    })

    test('returned value does not follow later changes', async () => {
        const a = engine.integer('A', 1)
        const b = engine.integer('B')
        engine.behaviour('BODY', '{@RETURN(A^GET());}')
        await engine.run('B^SET([BODY^RUN()+A^SET(5)+0]);')
        expect(b.getValue()).toBe(1)
    })

    test('method returning a primitive is an error', async () => {
        const a = engine.integer('A')
        ;(a as any).PRIMITIVE = async () => 5
        await engine.run('A^SET(A^PRIMITIVE());')
        expect(a.getValue()).toBe(0)
        expect(engine.errors).not.toHaveLength(0)
    })
})

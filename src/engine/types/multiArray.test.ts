import { TestEngine } from '../../common/testUtils'
import { MultiArray } from './multiArray'
import { Double } from './double'

describe('MULTIARRAY', () => {
    let engine: TestEngine
    let multiArray: MultiArray

    beforeEach(() => {
        engine = new TestEngine()
        multiArray = engine.add(
            new MultiArray(engine.asEngine(), engine.currentScene, {
                TYPE: 'MULTIARRAY',
                NAME: 'M',
                DIMENSIONS: 2,
            } as any)
        )
    })

    test('elements keep their type', async () => {
        await engine.run('M^SET(0, 1, 2.0);')
        expect(multiArray.getValue()[0][1]).toBeInstanceOf(Double)
        expect(await multiArray.GET(0, 1)).toBeInstanceOf(Double)
    })

    test('SET stores a copy of the variable', async () => {
        const a = engine.integer('A', 1)
        const b = engine.integer('B')
        await engine.run('M^SET(0, 0, A);A^SET(2);B^SET(M^GET(0, 0));')
        expect(a.getValue()).toBe(2)
        expect(b.getValue()).toBe(1)
    })

    test('GET of an unset cell gives null', async () => {
        const s = engine.string('S')
        await engine.run('M^SET(0, 1, 5);S^SET(M^GET(0, 0));')
        expect(s.getValue()).toBe('NULL')
    })
})

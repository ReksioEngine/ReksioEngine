import { TestEngine } from '../../common/testUtils'
import { Struct } from './struct'

describe('STRUCT', () => {
    let engine: TestEngine
    let struct: Struct

    beforeEach(async () => {
        engine = new TestEngine()
        struct = await engine.create<Struct>({
            TYPE: 'STRUCT',
            NAME: 'S',
            FIELDS: 'I<INTEGER>,D<DOUBLE>,T<STRING>,B<BOOL>',
        })
    })

    const field = (name: string) => struct.getField(name)?.getValue()

    test('SETFIELD converts the value to the type of the field', async () => {
        await engine.run('S^SETFIELD("I", "5");S^SETFIELD("D", "2.5");S^SETFIELD("T", 7);S^SETFIELD("B", "TRUE");')
        expect(field('I')).toBe(5)
        expect(field('D')).toBe(2.5)
        expect(field('T')).toBe('7')
        expect(field('B')).toBe(true)
    })

    test('INTEGER fields truncate', async () => {
        await engine.run('S^SETFIELD("I", 2.7);')
        expect(field('I')).toBe(2)
    })
})

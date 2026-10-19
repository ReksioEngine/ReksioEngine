import { TestEngine } from '../../common/testUtils'
import { Database } from './database'
import { Struct } from './struct'

describe('Database', () => {
    let engine: TestEngine

    describe('Loading from file', () => {
        let database: Database

        beforeEach(async () => {
            engine = new TestEngine()
            await engine.create<Struct>({ TYPE: 'STRUCT', NAME: 'MODEL', FIELDS: 'ID<INTEGER>,LABEL<STRING>' })
            database = await engine.create<Database>({ TYPE: 'DATABASE', NAME: 'DB', MODEL: { objectName: 'MODEL' } })
        })

        test('LOAD reads rows from a file in the scene directory', async () => {
            engine.addFile('DANE/SCENE/ITEMS.DTA', '1|FIRST\r\n2|SECOND\r\n')

            await database.LOAD('ITEMS.DTA')

            expect(database.GETROWSNO()).toBe(2)
            expect(await engine.getObject<Struct>('DB_CURSOR')?.GETFIELD('LABEL')?.getValue()).toBe('FIRST')
            expect(engine.errors).toHaveLength(0)
        })

        test('LOAD shifts fields left when a cell is empty', async () => {
            const engine = new TestEngine()
            await engine.create<Struct>({ TYPE: 'STRUCT', NAME: 'MODEL', FIELDS: 'A<INTEGER>,B<INTEGER>,C<INTEGER>' })
            const database = await engine.create<Database>({
                TYPE: 'DATABASE',
                NAME: 'DB',
                MODEL: { objectName: 'MODEL' },
            })

            engine.addFile('DANE/SCENE/ITEMS.DTA', '1||3')
            await database.LOAD('ITEMS.DTA')
            database.SELECT(0)

            // A = 1, B = 3, C = 0
            const row = engine.getObject<Struct>('DB_CURSOR')
            expect(await row?.GETFIELD('B')?.getValue()).toBe(3)
            expect(await row?.GETFIELD('C')?.getValue()).toBe(0)
        })
    })

    describe('Saving to file', () => {
        let database: Database

        beforeEach(async () => {
            engine = new TestEngine()
            await engine.create<Struct>({ TYPE: 'STRUCT', NAME: 'MODEL', FIELDS: 'ID<INTEGER>,LABEL<STRING>' })
            database = await engine.create<Database>({ TYPE: 'DATABASE', NAME: 'DB', MODEL: { objectName: 'MODEL' } })
        })

        test('SAVE writes rows in the format LOAD reads', async () => {
            engine.addFile('DANE/SCENE/ITEMS.DTA', '1|FIRST\r\n2|SECOND')
            await database.LOAD('ITEMS.DTA')

            await database.SAVE('COPY.DTA')

            const saved = await engine.filesystem.getFile('DANE/SCENE/COPY.DTA')
            expect(new TextDecoder().decode(saved)).toBe('1|FIRST\r\n2|SECOND')
        })

        describe('Saving doubles', () => {
            let database: Database
            let model: Struct
            beforeEach(async () => {
                model = await engine.create<Struct>({ TYPE: 'STRUCT', NAME: 'MODEL', FIELDS: 'VALUE<DOUBLE>' })
                database = await engine.create<Database>({
                    TYPE: 'DATABASE',
                    NAME: 'DB',
                    MODEL: { objectName: 'MODEL' },
                })
            })

            const addRow = async (value: number) => {
                const row = await model.clone()
                await row.setField('VALUE', value)
                ;(database as any).content.push(row)
            }

            test('whole numbers are written with five decimal places', async () => {
                await addRow(1234)
                await addRow(0)
                await database.SAVE('COPY.DTA')
                const saved = await engine.filesystem.getFile('DANE/SCENE/COPY.DTA')
                expect(new TextDecoder().decode(saved)).toBe('1234.00000\r\n00000')
            })

            test('negative whole numbers are written with five decimal places', async () => {
                await addRow(-1234)
                await database.SAVE('COPY.DTA')
                const saved = await engine.filesystem.getFile('DANE/SCENE/COPY.DTA')
                expect(new TextDecoder().decode(saved)).toBe('-1234.00000')
            })

            test('negative doubles are written with five decimal places', async () => {
                await addRow(-12.34)
                await database.SAVE('COPY.DTA')
                const saved = await engine.filesystem.getFile('DANE/SCENE/COPY.DTA')
                expect(new TextDecoder().decode(saved)).toBe('-12.34000')
            })

            test('negative doubles below one are written with a 0. prefix and bugged minus', async () => {
                await addRow(-0.34)
                await database.SAVE('COPY.DTA')
                const saved = await engine.filesystem.getFile('DANE/SCENE/COPY.DTA')
                expect(new TextDecoder().decode(saved)).toBe('0.-34000')
            })

            test('drops leading fractional zeros for negative values above -0.1', async () => {
                await addRow(-0.05)
                await addRow(-0.005)
                await addRow(-0.00005)

                await database.SAVE('COPY.DTA')
                const saved = await engine.filesystem.getFile('DANE/SCENE/COPY.DTA')
                expect(new TextDecoder().decode(saved)).toBe('0.-5000\r\n0.-500\r\n0.-5')
            })
        })
    })
})

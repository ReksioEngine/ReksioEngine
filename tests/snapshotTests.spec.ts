import * as path from 'path'
import { TestPlayerInstance } from './engine/testEngine'

const getAbsoluteGamePath = (gameName: string) => path.join(__dirname, './games', gameName)

const filterExpected = (fileList: string[]) => fileList.filter(e => e.toLowerCase().startsWith('output/'))
    .filter(e => !e.substring(e.indexOf('/') + 1).startsWith('.'))

describe('snapshot tests', () => {
    test('load and run empty scene (minimal directory structure)', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('empty-scene') })
        expect(testPlayer.currentScene).toBe('TESTSCENE')
        testPlayer.destroy()
    })

    test('load and run empty scene, then exit', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('empty-scene-exit'), waitForExit: true })
        expect(testPlayer.storage.list).toHaveLength(0)
        testPlayer.destroy()
    })

    test('load and run empty scene (full directory structure)', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('full-structure') })
        expect(testPlayer.currentScene).toBe('TESTSCENE')
        testPlayer.destroy()
    })

    test('load and run scene writing hello to arr, then exit', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('hello-world-arr'), waitForExit: true })
        expect(testPlayer.storage.list).toHaveLength(1)
        const expectedOutputFiles = filterExpected(testPlayer.fileLoader.getFilesListing())
        for (let expectedOutput of expectedOutputFiles) {
            expect(await testPlayer.storage.has(expectedOutput)).toBe(true)
            expect(await testPlayer.storage.get(expectedOutput)).toEqual(await testPlayer.fileLoader.getRawFile(expectedOutput))
        }
        testPlayer.destroy()
    })
})
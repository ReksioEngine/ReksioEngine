import * as path from 'path'
import { TestPlayerInstance } from './engine/testEngine'

const getAbsoluteGamePath = (gameName: string) => path.join(__dirname, './games', gameName)

describe('snapshot tests', () => {
    test('load and run empty scene (minimal directory structure)', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('empty-scene') })
        expect(testPlayer.currentScene).toBe('TESTSCENE')
        await testPlayer.runSnapshotTests({ expectedOutFileCount: 0 })
        testPlayer.destroy()
    })

    test('load and run empty scene, then exit', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('empty-scene-exit'), waitForExit: true })
        await testPlayer.runSnapshotTests({ expectedOutFileCount: 0 })
        testPlayer.destroy()
    })

    test('load and run empty scene (full directory structure)', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('full-structure') })
        expect(testPlayer.currentScene).toBe('TESTSCENE')
        await testPlayer.runSnapshotTests({ expectedOutFileCount: 0 })
        testPlayer.destroy()
    })

    test('load and run scene writing "HELLO" to an ARR file, then exit', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('hello-world-arr'), waitForExit: true })
        await testPlayer.runSnapshotTests({ expectedOutFileCount: 1 })
        testPlayer.destroy()
    })

    test('load and run scene displaying a colorful background and saving it back to an IMG file, then exit', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('basic-image'), waitForExit: true })
        await testPlayer.runSnapshotTests({ expectedOutFileCount: 1 })
        testPlayer.destroy()
    })

    test('load and run scene displaying the first frame of a simple ANN and saving it to an IMG file, then exit', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('basic-animation'), waitForExit: true })
        await testPlayer.runSnapshotTests({ expectedOutFileCount: 1 })
        testPlayer.destroy()
    })

    test('load and run scene displaying a colorful background and saving each opacity step to a separate IMG file, then exit', async () => {
        const testPlayer = await TestPlayerInstance.create({ gameBasePath: getAbsoluteGamePath('image-opacity-loop'), waitForExit: true })
        await testPlayer.runSnapshotTests({ expectedOutFileCount: 256 })
        testPlayer.destroy()
    })
})
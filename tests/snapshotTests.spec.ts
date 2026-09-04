import * as path from 'path'
import { GamePlayerOptions } from '../src'
import { InMemoryStorage } from './engine/inMemoryStorage'
import { createTestPlayer } from './engine/testEngine'
import { TestFileLoader } from './engine/testFileLoader'

const absoluteTestDirPath = path.join(__dirname, './scenes')

const makeDeferred = () => {
    const deferred: any = { };
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}

type PreparedGamePlayerOptions = {
    options: GamePlayerOptions;
    exitPromise: Promise<void>;
    fileLoader: TestFileLoader;
    storage: InMemoryStorage;
}

const prepareGamePlayerOptions = (relativePath: string): PreparedGamePlayerOptions => {
    const fileLoader = new TestFileLoader(path.join(absoluteTestDirPath, relativePath))
    const storage = new InMemoryStorage()
    const { promise, resolve, reject } = makeDeferred();
    return { options: { fileLoader, storage, onExit: resolve, onDestroy: () => reject('Engine destroyed') }, exitPromise: promise, fileLoader, storage }
}

const filterExpected = (fileList: string[]) => fileList.filter(e => e.toLowerCase().startsWith('output/'))
    .filter(e => !e.substring(e.indexOf('/') + 1).startsWith('.'))

describe('snapshot tests', () => {
    test('load and run empty scene (minimal directory structure)', async () => {
        const { options, exitPromise } = prepareGamePlayerOptions('empty-scene')
        exitPromise.catch(_ => { })
        const testPlayer = await createTestPlayer(options)
        await testPlayer.start()
        expect(testPlayer.currentScene).toBe('TESTSCENE')
        testPlayer.destroy()
    })

    test('load and run empty scene, then exit', async () => {
        const { options, exitPromise, storage } = prepareGamePlayerOptions('empty-scene-exit')
        const testPlayer = await createTestPlayer(options)
        await testPlayer.start()
        await exitPromise
        expect(storage.list).toHaveLength(0)
        testPlayer.destroy()
    })

    test('load and run empty scene (full directory structure)', async () => {
        const { options, exitPromise } = prepareGamePlayerOptions('full-structure')
        exitPromise.catch(_ => { })
        const testPlayer = await createTestPlayer(options)
        await testPlayer.start()
        expect(testPlayer.currentScene).toBe('TESTSCENE')
        testPlayer.destroy()
    })

    test('load and run scene writing hello to arr, then exit', async () => {
        const { options, exitPromise, storage } = prepareGamePlayerOptions('hello-world-arr')
        const testPlayer = await createTestPlayer(options)
        await testPlayer.start()
        await exitPromise
        const expectedOutputFiles = filterExpected(options.fileLoader.getFilesListing())
        expect(expectedOutputFiles).toHaveLength(1)
        for (let expectedOutput of expectedOutputFiles) {
            expect(await storage.has(expectedOutput)).toBe(true)
            expect(await storage.get(expectedOutput)).toEqual(await options.fileLoader.getRawFile(expectedOutput))
        }
        testPlayer.destroy()
    })
})
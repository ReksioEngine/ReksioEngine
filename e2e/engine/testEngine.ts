import { Buffer } from 'buffer'
import 'pixi.js-legacy'
import PIXI from 'pixi.js'
import { GamePlayerOptions, SaveFile } from '../../src'
import { Engine } from '../../src/engine'
import { deserializeArray } from '../../src/fileFormats/archive/array'
import { loadImage } from '../../src/fileFormats/img'
import { TestFileLoader } from './testFileLoader'
import { MemoryFileStorage } from '../../src/common/testUtils'

type Color = {
    r: number
    g: number
    b: number
    a: number
}

class Pixel {
    constructor(
        public index: number,
        public color: Color
    ) {}

    public static fromUint32ArrayElement(array: Uint32Array, index: number) {
        const pixel = array[index]
        return new Pixel(index, {
            a: (pixel >> 24) & 0xff,
            b: (pixel >> 16) & 0xff,
            g: (pixel >> 8) & 0xff,
            r: pixel & 0xff,
        })
    }
}

export type TestPlayerOptions = {
    gameBasePath: string
    waitForExit?: boolean
    saveFile?: SaveFile
    onSceneChange?: (next: string, previous?: string) => void
    onSaveFileUpdate?: (saveFile: SaveFile) => void
}

export type SnapshotTestsOptions = {
    expectedOutFileCount?: number
}

export class TestPlayerInstance {
    #engine: Engine
    #fileLoader: TestFileLoader
    #storage: MemoryFileStorage
    #exitPromise: Promise<void>

    private constructor(
        engine: Engine,
        fileLoader: TestFileLoader,
        storage: MemoryFileStorage,
        exitPromise: Promise<void>
    ) {
        if (engine.options.fileLoader !== fileLoader || engine.options.storage !== storage) {
            throw new Error('Engine created with options other than those passed in constructor')
        }
        this.#engine = engine
        this.#fileLoader = fileLoader
        this.#storage = storage
        this.#exitPromise = exitPromise
    }

    static async create(options: TestPlayerOptions) {
        const fileLoader = new TestFileLoader(options.gameBasePath)
        const storage = new MemoryFileStorage()
        const { exitPromise, onExit, onDestroy } = TestPlayerInstance.createExitPromise()

        const properOptions: GamePlayerOptions = { ...options, fileLoader, storage, onExit, onDestroy }

        const app = new PIXI.Application({ forceCanvas: true })
        const engine = new Engine(app, properOptions)

        await engine.init()
        await engine.start()

        if (options.waitForExit === true) {
            await exitPromise
        } else {
            exitPromise.catch((_) => {})
        }

        return new TestPlayerInstance(engine, fileLoader, storage, exitPromise)
    }

    async runSnapshotTests(options?: SnapshotTestsOptions) {
        const actualOutput = [...this.#storage.files.keys()]
        if (options?.expectedOutFileCount !== undefined) {
            expect(actualOutput).toHaveLength(options?.expectedOutFileCount)
        }
        const expectedOutput = this.#fileLoader.getSnapshotFilesListing()
        expect(expectedOutput).toHaveLength(actualOutput.length)

        for (const filename of expectedOutput) {
            expect(await this.#storage.has(filename)).toBe(true)
            const rawExpectedFile = await this.#fileLoader.getRawFile(filename)
            const rawActualFile = await this.#storage.get(filename)
            await this.#fileLoader.saveActualSnapshotFile(filename, rawActualFile)

            const extension = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
            console.debug(`Testing equality of two ${extension.toUpperCase()} files at path: ${filename}`)
            if (Buffer.from(rawActualFile).equals(Buffer.from(rawExpectedFile))) {
                continue
            }

            switch (extension) {
                case 'arr': {
                    const expectedArr = deserializeArray(rawExpectedFile)
                    const actualArr = deserializeArray(rawActualFile)
                    expect(actualArr).toEqual(expectedArr)
                    break
                }
                case 'img': {
                    const { header: expectedHeader, bytes: expectedBytes } = loadImage(rawExpectedFile)
                    const { header: actualHeader, bytes: actualBytes } = loadImage(rawActualFile)

                    expect(actualHeader).toEqual(expectedHeader)
                    expect(actualBytes.length).toEqual(expectedBytes.length)

                    const actualPixels = new Uint32Array(actualBytes.buffer, actualBytes.byteOffset)
                    const expectedPixels = new Uint32Array(expectedBytes.buffer, expectedBytes.byteOffset)
                    for (let i = 0; i < actualPixels.length; i++) {
                        if (actualPixels[i] !== expectedPixels[i]) {
                            const actualPixel = Pixel.fromUint32ArrayElement(actualPixels, i)
                            const expectedPixel = Pixel.fromUint32ArrayElement(expectedPixels, i)
                            expect(actualPixel).toEqual(expectedPixel)
                        }
                    }
                    break
                }
                default: {
                    // text file
                    expect(rawActualFile).toEqual(rawExpectedFile)
                    break
                }
            }
        }
    }

    destroy() {
        this.engine.destroy()
    }

    get currentScene() {
        return this.engine.currentScene?.name ?? null
    }

    get engine(): Readonly<Engine> {
        return this.#engine
    }

    get fileLoader(): Readonly<TestFileLoader> {
        return this.#fileLoader
    }

    get storage(): Readonly<MemoryFileStorage> {
        return this.#storage
    }

    async waitForExit() {
        await this.#exitPromise
    }

    private static createExitPromise() {
        const { promise, resolve, reject } = Promise.withResolvers<void>()
        return {
            exitPromise: promise,
            onExit: resolve,
            onDestroy: () => reject('Engine destroyed'),
        }
    }
}

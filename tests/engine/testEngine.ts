import 'pixi.js-legacy'
import PIXI from 'pixi.js'
import { GamePlayerOptions, SaveFile } from '../../src'
import { Engine } from '../../src/engine'
import { deserializeArray } from '../../src/fileFormats/archive/array'
import { loadImage } from '../../src/fileFormats/img'
import { TestFileLoader } from './testFileLoader'
import { InMemoryStorage } from './inMemoryStorage'

function makeDeferred<T>() {
    const deferred: any = { };
    deferred.promise = new Promise<T>((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred as {
        promise: Promise<T>,
        resolve: () => void,
        reject: (reason?: any) => void,
    };
}

type Color = {
    r: number
    g: number
    b: number
    a: number
}

class Pixel {
    constructor(public index: number, public color: Color) { }

    public static fromUint32ArrayElement(array: Uint32Array, index: number) {
        const pixel = array[index]
        return new Pixel(index, {
            a: (pixel >> 24) & 0xFF,
            b: (pixel >> 16) & 0xFF,
            g: (pixel >> 8) & 0xFF,
            r: pixel & 0xFF,
        })
    }
}

function callIfFieldDiffers<TObject, TValue>(obj1: TObject, obj2: TObject, getter: (object: TObject) => TValue, callback: () => void) {
    if (getter(obj1) !== getter(obj2)) {
        callback()
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
    #storage: InMemoryStorage
    #exitPromise: Promise<void>

    private constructor(engine: Engine, fileLoader: TestFileLoader, storage: InMemoryStorage, exitPromise: Promise<void>) {
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
        const storage = new InMemoryStorage()
        const { exitPromise, onExit, onDestroy } = TestPlayerInstance.createExitPromise()

        const properOptions: GamePlayerOptions = { ...options, fileLoader, storage, onExit, onDestroy }

        const app = new PIXI.Application({ forceCanvas: true })
        const engine = new Engine(app, properOptions)

        await engine.init()
        await engine.start()

        if (options.waitForExit === true) {
            await exitPromise
        } else {
            exitPromise.catch(_ => { })
        }

        return new TestPlayerInstance(engine, fileLoader, storage, exitPromise)
    }

    async runSnapshotTests(options?: SnapshotTestsOptions) {
        const actualOutput = this.#storage.list
        if (options?.expectedOutFileCount !== undefined) {
            expect(actualOutput).toHaveLength(options?.expectedOutFileCount)
        }
        const expectedOutput = this.#fileLoader.getSnapshotFilesListing()
        expect(expectedOutput).toHaveLength(actualOutput.length)
        
        for (const filename of expectedOutput) {
            expect(await this.#storage.has(filename)).toBe(true)
            const rawActualFile = await this.#storage.get(filename)
            await this.#fileLoader.saveActualSnapshotFile(filename, rawActualFile)
        }

        for (const filename of expectedOutput) {
            expect(await this.#storage.has(filename)).toBe(true)
            const rawExpectedFile = await this.#fileLoader.getRawFile(filename)
            const rawActualFile = await this.#storage.get(filename)
            await this.#fileLoader.saveActualSnapshotFile(filename, rawActualFile)

            const extension = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
            console.debug(`Testing equality of two ${extension.toUpperCase()} files at path: ${filename}`)
            if (rawActualFile.byteLength !== rawExpectedFile.byteLength) {
                console.warn(`Compared ${extension.toUpperCase()} files at path ${filename} differ in byte length`)
            } else {
                const actualBytes = new Uint8Array(rawActualFile)
                const expectedBytes = new Uint8Array(rawExpectedFile)
                let differingCount = actualBytes.reduce((sum, value, index) => sum + (value === expectedBytes[index] ? 0 : 1), 0)
                if (differingCount > 0) {
                    console.warn(`Compared ${extension.toUpperCase()} files at path ${filename} differ in content, ${differingCount} bytes in total`)
                }
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

                    expect(actualHeader.width).toEqual(expectedHeader.width)
                    expect(actualHeader.height).toEqual(expectedHeader.height)
                    expect(actualHeader.positionX).toEqual(expectedHeader.positionX)
                    expect(actualHeader.positionY).toEqual(expectedHeader.positionY)

                    const warner = (what: string) => console.warn(`Compared ${extension.toUpperCase()} files at path ${filename} have different ${what}`)
                    callIfFieldDiffers(actualHeader, expectedHeader, header => header.bpp, () => warner('bpp'))
                    callIfFieldDiffers(actualHeader, expectedHeader, header => header.compressionType, () => warner('compressionType'))
                    callIfFieldDiffers(actualHeader, expectedHeader, header => header.imageLen, () => warner('imageLen'))
                    callIfFieldDiffers(actualHeader, expectedHeader, header => header.alphaLen, () => warner('alphaLen'))

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

    get storage(): Readonly<InMemoryStorage> {
        return this.#storage
    }

    async waitForExit() {
        await this.#exitPromise
    }

    private static createExitPromise() {
        const { promise, resolve, reject } = makeDeferred<void>()
        return {
            exitPromise: promise as Promise<void>,
            onExit: resolve,
            onDestroy: () => reject('Engine destroyed'),
        }
    }
}
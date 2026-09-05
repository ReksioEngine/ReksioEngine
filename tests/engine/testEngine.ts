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
    return deferred;
}

export type TestPlayerOptions = {
    gameBasePath: string
    waitForExit?: boolean
    saveFile?: SaveFile
    onSceneChange?: (next: string, previous?: string) => void
    onSaveFileUpdate?: (saveFile: SaveFile) => void
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
        promise.status = 'pending'
        const onExit = () => {
            if (promise.status !== 'pending')
                return
            promise.status = 'resolved'
            resolve()
        }
        const onDestroy = () => {
            if (promise.status !== 'pending')
                return
            promise.status = 'rejected'
            reject('Engine destroyed')
        }

        return { exitPromise: promise as Promise<void>, onExit, onDestroy }
    }
}
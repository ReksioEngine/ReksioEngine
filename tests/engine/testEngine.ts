import * as path from 'path'
import 'pixi.js-legacy'
import PIXI from 'pixi.js'
import { GamePlayerOptions } from '../../src'
import { Engine } from '../../src/engine'
import { TestFileLoader } from './testFileLoader'
import { InMemoryStorage } from './inMemoryStorage'

const absoluteTestDirPath = path.join(__dirname, '../scenes')

export class TestPlayerInstance {
    constructor(private engine: Engine) { }

    async start() {
        await this.engine.start()
    }

    async restart(extraOptions?: GamePlayerOptions) {
        const app = new PIXI.Application({
            forceCanvas: true,
            view: this.engine.app.view,
        })

        this.destroy()
        const { fileLoader, storage } = this.engine.options
        this.engine = new Engine(app, { ...this.engine.options, ...(extraOptions ?? {}), fileLoader, storage })
        await this.engine.init()
        await this.engine.start()
    }

    destroy() {
        this.engine.destroy()
    }

    get currentScene() {
        return this.engine.currentScene?.name ?? null
    }
}

export const createTestPlayer = async (relativePath: string, options?: GamePlayerOptions) => {
    const app = new PIXI.Application({ forceCanvas: true })

    const fileLoader = new TestFileLoader(path.join(absoluteTestDirPath, relativePath))
    const storage = new InMemoryStorage()

    const engine = new Engine(app, { ...(options ?? {}), fileLoader, storage })
    await engine.init()

    return new TestPlayerInstance(engine)
}
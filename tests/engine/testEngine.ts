import 'pixi.js-legacy'
import PIXI from 'pixi.js'
import { GamePlayerOptions } from '../../src'
import { Engine } from '../../src/engine'

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
        this.engine = new Engine(app, { ...this.engine.options, ...(extraOptions ?? {}) })
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

export const createTestPlayer = async (options: GamePlayerOptions) => {
    const app = new PIXI.Application({ forceCanvas: true })

    const engine = new Engine(app, options)
    await engine.init()

    return new TestPlayerInstance(engine)
}
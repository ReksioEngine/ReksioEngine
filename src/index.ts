import { Engine } from './engine'
import * as PIXI from 'pixi.js'

const main = async () => {
    const app = new PIXI.Application()
    document.body.prepend(app.view as unknown as Node)

    const engine = new Engine(app)
    await engine.init()
}

main()

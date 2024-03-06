import {Engine} from './engine'
import * as PIXI from 'pixi.js'
import { sound } from '@pixi/sound'

const main = async () => {
    const app = new PIXI.Application()
    document.body.appendChild(app.view as unknown as Node)
    app.ticker.maxFPS = 16
    app.stage.interactive = true
    sound.disableAutoPause = true

    const engine = new Engine(app)
    await engine.init()

    app.ticker.add(delta => {
        engine.tick(delta)
    })
}

main()

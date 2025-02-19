import { Engine } from './engine'
import * as PIXI from 'pixi.js'
import { FileLoader } from './loaders/filesLoader'

export type GamePlayerOptions = {
    fileLoader: FileLoader
    startScene?: string
    debug?: boolean
    debugContainer: HTMLElement | null
    onExit?: () => void
}

export const createGamePlayer = (element: HTMLElement | null, options: GamePlayerOptions) => {
    if (element === null) {
        return
    }

    const app = new PIXI.Application()
    element.appendChild(app.view as unknown as Node)

    const engine = new Engine(app, options)
    engine.init()
}

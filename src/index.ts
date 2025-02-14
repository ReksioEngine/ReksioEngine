import { Engine } from './engine'
import * as PIXI from 'pixi.js'
import { FileLoader } from './loaders/filesLoader'

export type GamePlayerOptions = {
    fileLoader: FileLoader
    startScene?: string
    debug?: boolean
}

export const createGamePlayer = (element: HTMLElement | null, options: GamePlayerOptions) => {
    if (element === null) {
        return
    }

    const app = new PIXI.Application()
    const wrapper = document.createElement('div')
    wrapper.appendChild(app.view as unknown as Node)
    element.appendChild(wrapper)

    const engine = new Engine(element, app, options)
    engine.init()
}

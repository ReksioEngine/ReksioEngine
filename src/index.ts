import { Engine } from './engine'
import * as PIXI from 'pixi.js'

export const createGamePlayer = (element: HTMLElement | null) => {
    if (element === null) {
        return
    }

    const app = new PIXI.Application()
    const wrapper = document.createElement('div')
    wrapper.appendChild(app.view as unknown as Node)
    element.appendChild(wrapper)

    const engine = new Engine(element, app)
    engine.init()
}

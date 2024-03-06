import {Application, Graphics, Sprite} from 'pixi.js'

export const pathJoin = (...parts: Array<string>) => {
    const fixedParts = parts.map(part => part.replace(/\\/g, '/'))
    return fixedParts.join('/')
}

export const stringUntilNull = (text: string) => {
    return text.substring(0, text.indexOf('\x00'))
}

export const createColorSprite = (app: Application, color: number) => {
    const graphics = new Graphics()
    graphics.beginFill(color)
    graphics.drawRect(0, 0, app.view.width, app.view.height)

    const background = new Sprite(app.renderer.generateTexture(graphics))
    background.zIndex = -99999

    return background
}

export class NotImplementedError extends Error {
    constructor() {
        super('Not implemented')
    }
}


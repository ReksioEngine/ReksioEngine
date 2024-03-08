import {Application, Graphics, Sprite, Rectangle} from 'pixi.js'

export const pathJoin = (...parts: Array<string>) => {
    const fixedParts = parts.map(part => part.replace(/\\/g, '/'))
    return fixedParts.join('/')
}

export const stringUntilNull = (text: string) => {
    return text.substring(0, text.indexOf('\x00'))
}

export const createColorTexture = (app: Application, dimensions: Rectangle, color: number) => {
    const graphics = new Graphics()
    graphics.beginFill(color)
    graphics.drawRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height)
    return app.renderer.generateTexture(graphics)
}

export const createColorSprite = (app: Application, dimensions: Rectangle, color: number) => {
    const background = new Sprite(createColorTexture(app, dimensions, color))
    background.zIndex = -99999
    return background
}

export class NotImplementedError extends Error {
    constructor() {
        super('Not implemented')
    }
}


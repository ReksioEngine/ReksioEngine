import {Application, Graphics, Sprite, Rectangle} from 'pixi.js'
import {assert} from './errors'

export const pathJoin = (...parts: Array<string>) => {
    const fixedParts = parts.map(part => part.replace(/\\/g, '/'))
    return fixedParts.join('/')
}

export const stringUntilNull = (text: string) => {
    return text.substring(0, text.indexOf('\x00'))
}

export const createColorGraphics = (dimensions: Rectangle, color: number, alpha?: number, borderWidth?: number, borderColor?: number) => {
    const graphics = new Graphics()
    graphics.beginFill(color, alpha)
    if (borderWidth !== undefined && borderWidth > 0) {
        graphics.lineStyle(borderWidth, borderColor ?? 0xffa500)
    }
    graphics.drawRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height)
    return graphics
}

export const createColorTexture = (app: Application, dimensions: Rectangle, color: number, alpha?: number) => {
    const graphics = createColorGraphics(dimensions, color, alpha)
    return app.renderer.generateTexture(graphics)
}

export const createColorSprite = (app: Application, dimensions: Rectangle, color: number, alpha?: number) => {
    const background = new Sprite(createColorTexture(app, dimensions, color, alpha))
    background.zIndex = -99999
    return background
}

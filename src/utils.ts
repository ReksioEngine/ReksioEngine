import {Application, Graphics, Rectangle} from 'pixi.js'

export const pathJoin = (...parts: Array<string>) => {
    const fixedParts = parts.map(part => part.replace(/\\/g, '/'))
    return fixedParts.join('/')
}

export const stringUntilNull = (text: string) => {
    return text.substring(0, text.indexOf('\x00'))
}

export const drawRectangle = (graphics: Graphics, dimensions: Rectangle, color: number, alpha?: number, borderWidth?: number, borderColor?: number) => {
    graphics.beginFill(color, alpha)
    if (borderWidth !== undefined && borderWidth > 0) {
        graphics.lineStyle(borderWidth, borderColor ?? 0xffa500)
    }
    graphics.drawRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height)
}

export const createColorTexture = (app: Application, dimensions: Rectangle, color: number, alpha?: number) => {
    const graphics = new Graphics()
    drawRectangle(graphics, dimensions, color, alpha)
    return app.renderer.generateTexture(graphics)
}

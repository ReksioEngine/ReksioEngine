import { Application, Graphics, IPointData, Rectangle, Sprite } from 'pixi.js'
import { assert } from '../common/errors'

export class AdvancedSprite extends Sprite {
    public hitmap?: Uint8Array
    public checkPixelPerfect = false

    getAlphaAt(point: IPointData) {
        assert(this.hitmap !== undefined)

        const tempPoint = { x: 0, y: 0 }
        this.worldTransform.applyInverse(point, tempPoint)

        const width = this._texture.orig.width
        const height = this._texture.orig.height
        const x = Math.floor(tempPoint.x + width * this.anchor.x)
        const y = Math.floor(tempPoint.y + height * this.anchor.y)

        if (x < 0 || x > width || y < 0 || y > height) {
            return 0 // unsure
        }

        const pixelOffset = y * width + x
        if (pixelOffset > this.hitmap.length - 1) {
            return 0 // unsure
        }

        return this.hitmap[pixelOffset]
    }

    containsPoint(point: IPointData) {
        if (!this.checkPixelPerfect || !this.hitmap) {
            return super.containsPoint(point)
        }

        const alpha = this.getAlphaAt(point)
        return alpha !== null && alpha > 0
    }
}

export const createHitmapFromImageBytes = (bytes: Uint8Array) => {
    const hitmap = new Uint8Array(bytes.byteLength / 4)
    for (let i = 0; i < hitmap.byteLength; i++) {
        hitmap[i] = bytes[i * 4 + 3]
    }
    return hitmap
}

export const drawRectangle = (
    graphics: Graphics,
    dimensions: Rectangle,
    color: number,
    alpha?: number,
    borderWidth?: number,
    borderColor?: number
) => {
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

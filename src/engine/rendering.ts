import {IPointData, Sprite} from 'pixi.js'

export class AdvancedSprite extends Sprite {
    public hitmap?: Uint8Array
    public checkPixelPerfect = false

    containsPoint(point: IPointData) {
        if (!this.checkPixelPerfect || !this.hitmap) {
            return super.containsPoint(point)
        }

        const tempPoint = {x : 0, y : 0}
        this.worldTransform.applyInverse(point, tempPoint)

        const width = this._texture.orig.width
        const height = this._texture.orig.height
        const x = tempPoint.x + width * this.anchor.x
        const y = tempPoint.y + height * this.anchor.y

        if(x < 0 || x > width) return false
        if(y < 0 || y > height) return false

        const pixelOffset = (Math.floor(y) * width + Math.floor(x))
        return pixelOffset <= this.hitmap.length - 1 && this.hitmap[pixelOffset] > 0
    }
}

export const createHitmapFromImageBytes = (bytes: Uint8Array) => {
    const hitmap = new Uint8Array(bytes.byteLength / 4)
    for (let i = 0; i < hitmap.byteLength; i++) {
        hitmap[i] = bytes[i * 4 + 3]
    }
    return hitmap
}

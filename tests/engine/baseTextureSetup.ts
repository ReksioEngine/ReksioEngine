import 'pixi.js-legacy'
import { BaseTexture, BufferResource, Resource, utils } from "pixi.js";

const originalBaseTextureGetDrawableSource = BaseTexture.prototype.getDrawableSource
if (!originalBaseTextureGetDrawableSource) {
    throw new Error("Missing pixi.js-legacy import")
}

BaseTexture.prototype.getDrawableSource = function() {
    const resource: Resource = this.resource;
    if (resource instanceof BufferResource && resource.data) {
        const { canvas, context } = new utils.CanvasRenderTarget(this.width, this.height, 1)
        const imageData = context.createImageData(this.width, this.height)
        imageData.data.set(resource.data)
        context.putImageData(imageData, 0, 0)
        return canvas as CanvasImageSource
    } else {
        return originalBaseTextureGetDrawableSource.call(this)
    }
}

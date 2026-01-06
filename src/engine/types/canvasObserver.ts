import { DisplayType, Type } from './index'
import { CanvasObserverDefinition } from '../../fileFormats/cnv/types'
import { loadTexture } from '../../filesystem/assetsLoader'
import { Point, Rectangle } from 'pixi.js'
import { method } from '../../common/types'
import { AdvancedSprite } from '../rendering'
import { assert } from '../../common/errors'
import { buildImage } from '../../fileFormats/img'
import { logger } from '../logging'

export class CanvasObserver extends Type<CanvasObserverDefinition> {
    @method()
    async SETBACKGROUND(filename: string) {
        const relativePath = await this.engine.currentScene?.getRelativePath(filename)
        const texture = await loadTexture(this.engine.filesystem, relativePath!)
        if (texture == null) {
            throw new Error(`Cannot load image '${filename}'`)
        }

        this.engine.rendering.setBackground(texture)
    }

    @method()
    REFRESH() {}

    @method()
    GETGRAPHICSAT(
        x: number,
        y: number,
        onlyVisible: boolean = false,
        minZ: number = Number.MIN_SAFE_INTEGER,
        maxZ: number = Number.MAX_SAFE_INTEGER,
        ignoreAlpha: boolean = false
    ) {
        const point = new Point(x, y)

        for (let i = this.engine.app.stage.children.length - 1; i >= 0; i--) {
            const renderObject = this.engine.app.stage.children[i]
            if (!(renderObject instanceof AdvancedSprite)) {
                continue
            }

            if (onlyVisible && !renderObject.visible) {
                continue
            }

            const position = renderObject.getGlobalPosition()
            if (position === null) {
                continue
            }

            const containsPoint = renderObject.containsPoint(point, !ignoreAlpha)
            if (containsPoint && renderObject.zIndex >= minZ && renderObject.zIndex <= maxZ) {
                const object: DisplayType<any> | null = this.engine.scopeManager.find(
                    (key: string, obj) => obj instanceof DisplayType && obj.getRenderObject() === renderObject
                )
                if (object === null) {
                    continue
                }
                return object.name
            }
        }

        return null
    }

    @method()
    async SAVE(filename: string, scaleX: number, scaleY: number, left = 0, top = 0, right = 0, bottom = 0) {
        assert(this.engine.currentScene !== null)

        const rectangle = (right != left && bottom != top)
            ? new Rectangle(left, top, right-left, bottom-top)
            : new Rectangle(0, 0, this.engine.app.view.width, this.engine.app.view.height)

        const originalCanvas = await this.engine.app.renderer.extract.image(
            this.engine.app.stage,
            undefined,
            undefined,
            rectangle
        )

        const scaledCanvas = document.createElement('canvas')
        scaledCanvas.width = Math.floor(originalCanvas.width * scaleX)
        scaledCanvas.height = Math.floor(originalCanvas.height * scaleY)
        const scaledCanvasCtx = scaledCanvas.getContext('2d')
        assert(scaledCanvasCtx !== null)

        scaledCanvasCtx.scale(scaleX, scaleY)
        scaledCanvasCtx.drawImage(originalCanvas, 0, 0)

        const imageData = scaledCanvasCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height)
        const pixels = imageData.data
        const imgFile = buildImage(
            {
                bpp: 16,
                positionX: 0,
                positionY: 0,
                compressionType: 0,
                width: Math.floor(this.engine.app.view.width * scaleX),
                height: Math.floor(this.engine.app.view.height * scaleY),
                imageLen: -1,
                alphaLen: -1,
            },
            pixels
        )

        const virtualPath = await this.engine.currentScene.getRelativePath(filename)
        logger.debug(`Saving canvas to "${virtualPath}"`, {
            observer: this
        })

        await this.engine.filesystem.saveFile(
            virtualPath,
            imgFile
        )
    }
}

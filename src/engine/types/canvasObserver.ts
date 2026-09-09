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
    REMOVE(objectName: string) {
        const object = this.engine.getObject(objectName)
        if (object == null || !(object instanceof DisplayType)) {
            return
        }

        const renderObject = object.getRenderObject()
        if (renderObject != null) {
            this.engine.rendering.removeFromStage(renderObject)
        }
    }

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

        const rectangle =
            right != left && bottom != top
                ? new Rectangle(left, top, right - left, bottom - top)
                : new Rectangle(0, 0, this.engine.app.view.width, this.engine.app.view.height)

        const screenshotCanvas = this.engine.app.renderer.extract.canvas(this.engine.app.stage, rectangle)
        screenshotCanvas.width = Math.trunc(screenshotCanvas.width * scaleX)
        screenshotCanvas.height = Math.trunc(screenshotCanvas.height * scaleY)

        const screenshotCanvasCtx = screenshotCanvas.getContext('2d')
        assert(screenshotCanvasCtx !== null)
        screenshotCanvasCtx.scale(scaleX, scaleY)

        const imageData = screenshotCanvasCtx.getImageData(0, 0, screenshotCanvas.width, screenshotCanvas.height)
        const imgFile = buildImage(
            {
                bpp: 16,
                positionX: 0,
                positionY: 0,
                compressionType: 0,
                width: imageData.width,
                height: imageData.height,
                imageLen: -1,
                alphaLen: -1,
            },
            imageData.data
        )

        const virtualPath = await this.engine.currentScene.getRelativePath(filename)
        logger.debug(`Saving canvas to "${virtualPath}"`, {
            observer: this,
        })

        await this.engine.filesystem.saveFile(virtualPath, imgFile)
    }
}

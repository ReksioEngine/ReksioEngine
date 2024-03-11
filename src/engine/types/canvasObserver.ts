import {Type} from './index'
import {CanvasObserverDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {loadTexture} from '../assetsLoader'
import {Point} from 'pixi.js'

export class CanvasObserver extends Type<CanvasObserverDefinition> {
    constructor(engine: Engine, definition: CanvasObserverDefinition) {
        super(engine, definition)
    }

    async SETBACKGROUND(filename: string) {
        const relativePath = this.engine.currentScene?.getRelativePath(filename)
        const texture = await loadTexture(this.engine.fileLoader, relativePath!)
        if (texture == null) {
            throw new Error(`Cannot load image '${filename}'`)
        }

        this.engine.canvasBackground.texture = texture
    }

    REFRESH() {}

    // TODO include alpha
    GETGRAPHICSAT(x: number, y: number, someBool1: boolean, minZ: number, maxZ: number, includeAlpha: boolean) {
        const point = new Point(x, y)

        for (const object of Object.values(this.engine.scope)) {
            const renderObject = object.getRenderObject()
            if (renderObject === null) {
                continue
            }

            const position = renderObject.getGlobalPosition()
            if (position === null) {
                continue
            }

            const containsPoint = point.x > position.x &&
                point.x < position?.x + renderObject.width &&
                point.y > position.y &&
                point.y < position.y + renderObject.height

            if (containsPoint && renderObject.zIndex >= minZ && renderObject.zIndex <= maxZ) {
                return object.name
            }
        }

        return null
    }
}

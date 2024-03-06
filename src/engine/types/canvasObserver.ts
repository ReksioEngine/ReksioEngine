import {Type} from './index'
import {CanvasObserverDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'
import {loadTexture} from '../assetsLoader'

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

    GETGRAPHICSAT(x: number, y: number, someBool1: boolean, minZ: number, maxZ: number, includeAlpha: boolean) {
        throw new NotImplementedError()
    }
}

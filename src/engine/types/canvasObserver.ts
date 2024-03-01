import {Type} from './index'
import {CanvasObserverDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'

export class CanvasObserver extends Type<CanvasObserverDefinition> {
    constructor(engine: Engine, definition: CanvasObserverDefinition) {
        super(engine, definition)
    }

    SETBACKGROUND(filename: string) {
        throw new NotImplementedError()
    }

    REFRESH() {
        throw new NotImplementedError()
    }

    GETGRAPHICSAT(x: number, y: number, someBool1: boolean, minZ: number, maxZ: number, includeAlpha: boolean) {
        throw new NotImplementedError()
    }
}

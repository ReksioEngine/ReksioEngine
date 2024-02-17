import {Type} from './index'
import {Engine} from '../index'
import {ImageDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'

export class Image extends Type<ImageDefinition> {
    private visible: boolean
    private opacity: number = 1
    private priority: number

    private x: number = 0
    private y: number = 0

    constructor(engine: Engine, definition: ImageDefinition) {
        super(engine, definition)
        this.visible = definition.VISIBLE
        this.priority = definition.PRIORITY
    }

    SETOPACITY(opacity: number) {
        this.opacity = opacity
    }

    MOVE(xOffset: number, yOffset: number) {
        this.x += xOffset
        this.y += yOffset
    }

    SETPOSITION(x: number, y: number) {
        this.x = x
        this.y = y
    }

    SETPRIORITY(priority: number) {
        this.priority = priority
    }

    CLONE() {
        throw NotImplementedError
    }

    SHOW() {
        this.visible = true
    }

    HIDE() {
        this.visible = false
    }

    GETPOSITIONY() {
        return this.y
    }

    GETALPHA(x: number, y: number) {
        throw NotImplementedError
    }
}

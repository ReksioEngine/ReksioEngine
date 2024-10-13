import {Type} from './index'
import {Engine} from '../index'
import {MouseDefinition} from '../../fileFormats/cnv/types'
import {FederatedPointerEvent, Point} from 'pixi.js'
import {NotImplementedError} from '../../errors'

export class Mouse extends Type<MouseDefinition> {
    private mousePosition: Point = new Point(0, 0)

    private mouseMoveListener: any
    private mouseClickListener: any
    private mouseReleaseListener: any

    private clicked = false
    private released = false

    constructor(engine: Engine, definition: MouseDefinition) {
        super(engine, definition)
        this.callbacks.registerGroup('ONCLICK', definition.ONCLICK)
        this.callbacks.registerGroup('ONRELEASE', definition.ONRELEASE)
    }

    init() {
        this.ENABLE()
    }

    destroy() {
        this.DISABLE()
    }

    tick(elapsedMS: number) {
        if (this.clicked) {
            this.callbacks.run('ONCLICK')
            this.clicked = false
        }
        if (this.released) {
            this.callbacks.run('ONRELEASE')
            this.released = false
        }
    }

    onMouseMove(event: FederatedPointerEvent) {
        this.mousePosition = new Point(Math.floor(event.screen.x), Math.floor(event.screen.y))
    }

    onMouseClick(event: FederatedPointerEvent) {
        this.onMouseMove(event)
        this.clicked = true
    }

    onMouseRelease(event: FederatedPointerEvent) {
        this.onMouseMove(event)
        this.released = true
    }

    SET(cursorType: 'ACTIVE' | 'ARROW') {
        throw new NotImplementedError()
    }

    ENABLE() {
        this.mouseMoveListener = this.onMouseMove.bind(this)
        this.mouseClickListener = this.onMouseClick.bind(this)
        this.mouseReleaseListener = this.onMouseRelease.bind(this)

        this.engine.app.stage.addListener('pointermove', this.mouseMoveListener)
        if (this.callbacks.has('ONCLICK')) {
            this.engine.app.stage.addListener('pointerdown', this.mouseClickListener)
        }
        if (this.callbacks.has('ONRELEASE')) {
            this.engine.app.stage.addListener('pointerup', this.mouseReleaseListener)
        }
    }

    DISABLE() {
        this.engine.app.stage.removeListener('pointermove', this.mouseMoveListener)
        this.engine.app.stage.removeListener('pointerdown', this.mouseClickListener)
    }

    SHOW() {
        throw new NotImplementedError()
    }

    HIDE() {
        throw new NotImplementedError()
    }

    GETPOSX() {
        return this.mousePosition.x
    }

    GETPOSY() {
        return this.mousePosition.y
    }
}

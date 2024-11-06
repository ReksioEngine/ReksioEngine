import {Type} from './index'
import {MouseDefinition} from '../../fileFormats/cnv/types'
import {FederatedPointerEvent, Point} from 'pixi.js'
import {NotImplementedError} from '../../errors'
import {method} from '../../types'

export class Mouse extends Type<MouseDefinition> {
    private mousePosition: Point = new Point(0, 0)

    private mouseMoveListener: any
    private mouseClickListener: any
    private mouseReleaseListener: any

    private clicked = false
    private released = false
    private moved = false

    ready() {
        this.ENABLE()
        this.callbacks.run('ONINIT')
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
        if (this.moved) {
            this.callbacks.run('ONMOVE')
            this.moved = false
        }
    }

    @method()
    SET(cursorType: 'ACTIVE' | 'ARROW') {
        throw new NotImplementedError()
    }

    @method()
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

    @method()
    DISABLE() {
        this.engine.app.stage.removeListener('pointermove', this.mouseMoveListener)
        this.engine.app.stage.removeListener('pointerdown', this.mouseClickListener)
    }

    @method()
    SHOW() {
        throw new NotImplementedError()
    }

    @method()
    HIDE() {
        throw new NotImplementedError()
    }

    @method()
    GETPOSX() {
        return this.mousePosition.x
    }

    @method()
    GETPOSY() {
        return this.mousePosition.y
    }

    private onMouseMove(event: FederatedPointerEvent) {
        this.mousePosition = new Point(Math.floor(event.screen.x), Math.floor(event.screen.y))
        this.moved = true
    }

    private onMouseClick(event: FederatedPointerEvent) {
        this.onMouseMove(event)
        this.clicked = true
    }

    private onMouseRelease(event: FederatedPointerEvent) {
        this.onMouseMove(event)
        this.released = true
    }
}

import {Type} from './index'
import {Engine} from '../index'
import {MouseDefinition} from '../../fileFormats/cnv/types'
import {FederatedPointerEvent, Point} from 'pixi.js'
import {NotImplementedError} from '../../utils'

export class Mouse extends Type<MouseDefinition> {
    private mousePosition: Point = new Point(0, 0)

    private mouseMoveListener: any
    private mouseClickListener: any

    private clicked = false

    constructor(engine: Engine, definition: MouseDefinition) {
        super(engine, definition)
        this.callbacks.registerGroup('ONCLICK', definition.ONCLICK)
    }

    init() {
        this.ENABLE()
    }

    destroy() {
        this.DISABLE()
    }

    tick(delta: number) {
        if (this.clicked) {
            this.ONCLICK()
            this.clicked = false
        }
    }

    onMouseMove(event: FederatedPointerEvent) {
        this.mousePosition = new Point(Math.floor(event.screen.x), Math.floor(event.screen.y))
    }

    onMouseClick(event: FederatedPointerEvent) {
        this.onMouseMove(event)
        this.clicked = true
    }

    SET(cursorType: 'ACTIVE' | 'ARROW') {
        throw new NotImplementedError()
    }

    ENABLE() {
        this.mouseMoveListener = this.onMouseMove.bind(this)
        this.mouseClickListener = this.onMouseClick.bind(this)

        this.engine.app.stage.addListener('pointermove', this.mouseMoveListener)
        if (this.callbacks.has('ONCLICK')) {
            this.engine.app.stage.addListener('pointerdown', this.mouseClickListener)
        }
    }

    DISABLE() {
        this.engine.app.stage.removeListener('pointermove', this.mouseMoveListener)
        this.engine.app.stage.removeListener('pointerdown', this.mouseClickListener)
    }

    GETPOSX() {
        return this.mousePosition.x
    }

    GETPOSY() {
        return this.mousePosition.y
    }

    ONCLICK() {
        this.callbacks.run('ONCLICK')
    }

    debuggerValues() {
        return {
            ...super.debuggerValues(),
            position: this.mousePosition
        }
    }
}

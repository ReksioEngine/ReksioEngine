import {Type} from './index'
import {Engine} from '../index'
import {MouseDefinition} from '../../fileFormats/cnv/types'
import {FederatedPointerEvent, Point} from 'pixi.js'
import {NotImplementedError} from '../../utils'

export class Mouse extends Type<MouseDefinition> {
    private mousePosition: Point = new Point(0, 0)

    private mouseMoveListener: any
    private mouseClickListener: any

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

    onMouseMove(event: FederatedPointerEvent) {
        this.mousePosition = new Point(Math.floor(event.screen.x), Math.floor(event.screen.y))
    }

    onMouseClick(event: FederatedPointerEvent) {
        this.onMouseMove(event)
        this.ONCLICK()
    }

    SET(cursorType: 'ACTIVE' | 'ARROW') {
        throw new NotImplementedError()
    }

    ENABLE() {
        this.mouseMoveListener = this.onMouseMove.bind(this)
        this.mouseClickListener = this.onMouseClick.bind(this)

        this.engine.app.stage.addListener('mousemove', this.mouseMoveListener)
        if (this.callbacks.has('ONCLICK')) {
            this.engine.app.stage.addListener('mousedown', this.mouseClickListener)
        }
    }

    DISABLE() {
        this.engine.app.stage.removeListener('mousemove', this.mouseMoveListener)
        this.engine.app.stage.removeListener('mousedown', this.mouseClickListener)
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
}

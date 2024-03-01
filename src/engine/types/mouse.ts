import {Type} from './index'
import {Engine} from '../index'
import {callback, MouseDefinition} from '../../fileFormats/cnv/types'
import {FederatedPointerEvent, Point} from 'pixi.js'

export class Mouse extends Type<MouseDefinition> {
    private enabled: boolean = true
    private cursorType: string = 'ARROW'

    private readonly onClick: callback
    private mousePosition: Point = new Point(0, 0)

    private mouseMoveListener: any
    private mouseClickListener: any

    constructor(engine: Engine, definition: MouseDefinition) {
        super(engine, definition)
        this.onClick = definition.ONCLICK
    }

    init() {
        this.mouseMoveListener = this.onMouseMove.bind(this)
        this.mouseClickListener = this.onMouseClick.bind(this)

        this.engine.app.stage.addListener('mousemove', this.mouseMoveListener)
        if (this.definition.ONCLICK) {
            this.engine.app.stage.addListener('mousedown', this.mouseClickListener)
        }
    }

    destroy() {
        this.engine.app.stage.removeListener('mousemove', this.mouseMoveListener)
        this.engine.app.stage.removeListener('mousedown', this.mouseClickListener)
    }

    onMouseMove(event: FederatedPointerEvent) {
        this.mousePosition = new Point(Math.floor(event.screen.x), Math.floor(event.screen.y))
    }

    onMouseClick(event: FederatedPointerEvent) {
        this.onMouseMove(event)
        this.ONCLICK()
    }

    // ACTIVE, ARROW
    SET(cursorType: string) {
        this.cursorType = cursorType
    }

    ENABLE() {
        this.enabled = true
    }

    DISABLE() {
        this.enabled = false
    }

    GETPOSX() {
        return this.mousePosition.x
    }

    GETPOSY() {
        return this.mousePosition.y
    }

    ONCLICK() {
        if (this.onClick) {
            this.engine.executeCallback(this, this.onClick)
        }
    }
}

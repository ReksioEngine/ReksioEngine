import {Type} from './index'
import {Engine} from '../index'
import {ButtonDefinition} from '../../fileFormats/cnv/types'
import {createColorGraphics, NotImplementedError} from '../../utils'
import {Image} from './image'
import {Graphics, Rectangle} from 'pixi.js'
import { t, StateMachine } from 'typescript-fsm'

enum States {
    INIT,
    DISABLED,
    DISABLED_BUT_VISIBLE,
    STANDARD,
    HOVERED,
    PRESSED
}

enum Events {
    OVER,
    DOWN,
    UP,
    OUT,
    ENABLE,
    DISABLE,
    DISABLE_BUT_VISIBLE
}

export class Button extends Type<ButtonDefinition> {
    private gfxStandard?: Image
    private gfxOnClick?: Image
    private gfxOnMove?: Image

    private interactArea?: Graphics
    private interactAreaDebug?: Graphics
    private stateMachine: StateMachine<States, Events>

    private readonly onMouseOverCallback
    private readonly onMouseOutCallback
    private readonly onMouseDownCallback
    private readonly onMouseUpCallback

    constructor(engine: Engine, definition: ButtonDefinition) {
        super(engine, definition)
        this.onMouseOverCallback = this.onMouseOver.bind(this)
        this.onMouseOutCallback = this.onMouseOut.bind(this)
        this.onMouseDownCallback = this.onMouseDown.bind(this)
        this.onMouseUpCallback = this.onMouseUp.bind(this)

        const stateCallback = this.onStateChange.bind(this)
        const transitions = [
            t(States.INIT, Events.ENABLE, States.STANDARD, stateCallback),
            t(States.INIT, Events.DISABLE, States.DISABLED, stateCallback),

            t(States.STANDARD, Events.OVER, States.HOVERED, stateCallback),
            t(States.HOVERED, Events.OUT, States.STANDARD, stateCallback),
            t(States.HOVERED, Events.DOWN, States.PRESSED, stateCallback),
            t(States.PRESSED, Events.UP, States.HOVERED, stateCallback),
            t(States.PRESSED, Events.OUT, States.STANDARD, stateCallback),
            t(States.DISABLED, Events.ENABLE, States.STANDARD, stateCallback),

            t(States.STANDARD, Events.DISABLE, States.DISABLED, stateCallback),
            t(States.HOVERED, Events.DISABLE, States.DISABLED, stateCallback),
            t(States.PRESSED, Events.DISABLE, States.DISABLED, stateCallback),

            t(States.STANDARD, Events.ENABLE, States.STANDARD, stateCallback),
            t(States.DISABLED, Events.DISABLE, States.DISABLED, stateCallback),
        ]
        this.stateMachine = new StateMachine<States, Events>(
            States.INIT,
            transitions
        )
    }

    onStateChange() {
        const state = this.stateMachine.getState()
        if (this.interactArea) {
            // For area button
            this.interactArea.visible = state != States.DISABLED
            this.interactArea.interactive = state != States.DISABLED
        } else {
            // For GFX button
            if (state == States.DISABLED) {
                this.gfxStandard?.HIDE()
                this.gfxOnMove?.HIDE()
                this.gfxOnClick?.HIDE()
            } else if (state == States.HOVERED && this.gfxOnMove) {
                this.gfxStandard?.HIDE()
                this.gfxOnMove?.SHOW()
                this.gfxOnClick?.HIDE()
            } else if (state == States.PRESSED && this.gfxOnClick) {
                this.gfxStandard?.HIDE()
                this.gfxOnMove?.HIDE()
                this.gfxOnClick?.SHOW()
            } else {
                this.gfxStandard?.SHOW()
                this.gfxOnMove?.HIDE()
                this.gfxOnClick?.HIDE()
            }
        }
    }

    init() {
        if (this.definition.RECT) {
            const [x1, y1, x2, y2] = this.definition.RECT
            const rect = new Rectangle(x1, y1, x2-x1, y2-y1)
            this.interactArea = createColorGraphics(rect, 0, 0)
            this.interactArea.interactive = true
            this.interactArea.hitArea = rect
            this.interactArea.zIndex = 9999999 - y1
            this.interactArea.cursor = 'pointer'
            this.interactArea.visible = this.definition.ENABLE

            if (this.engine.debug) {
                this.interactAreaDebug = createColorGraphics(rect, 0, 0, 3)
                this.interactAreaDebug.zIndex = 99999999
            }
        }
    }

    ready() {
        if (this.interactArea) {
            this.interactArea.addListener('mouseover', this.onMouseOverCallback)
            this.interactArea.addListener('mouseout', this.onMouseOutCallback)
            this.interactArea.addListener('mousedown', this.onMouseDownCallback)
            this.interactArea.addListener('mouseup', this.onMouseUpCallback)
            this.engine.app.stage.addChild(this.interactArea)
        }
        if (this.interactAreaDebug) {
            this.engine.app.stage.addChild(this.interactAreaDebug)
        }

        // This has to be in ready() because it references other objects assigned in init()...
        if (this.definition.GFXSTANDARD) {
            this.gfxStandard = this.engine.getObject(this.definition.GFXSTANDARD)
        }
        if (this.definition.GFXONCLICK) {
            this.gfxOnClick = this.engine.getObject(this.definition.GFXONCLICK)
        }
        if (this.definition.GFXONMOVE) {
            this.gfxOnMove = this.engine.getObject(this.definition.GFXONMOVE)
        }
        this.stateMachine.dispatch(this.definition.ENABLE ? Events.ENABLE : Events.DISABLE)
        // ...including ONINIT
        if (this.definition.ONINIT) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }

        const sprites = [
            this.gfxStandard?.sprite,
            this.gfxOnMove?.sprite,
            this.gfxOnClick?.sprite
        ]

        for (const sprite of sprites) {
            if (!sprite) continue
            sprite.interactive = true
            sprite.cursor = 'pointer'
            sprite.addListener('mouseover', this.onMouseOverCallback)
            sprite.addListener('mouseout', this.onMouseOutCallback)
            sprite.addListener('mousedown', this.onMouseDownCallback)
            sprite.addListener('mouseup', this.onMouseUpCallback)
        }
    }

    destroy() {
        if (this.interactArea) {
            this.interactArea.removeListener('mouseover', this.onMouseOverCallback)
            this.interactArea.removeListener('mouseout', this.onMouseOutCallback)
            this.interactArea.removeListener('mousedown', this.onMouseDownCallback)
            this.interactArea.removeListener('mouseup', this.onMouseUpCallback)
            this.engine.app.stage.removeChild(this.interactArea)
        }
        if (this.interactAreaDebug) {
            this.engine.app.stage.removeChild(this.interactAreaDebug)
        }

        if (this.gfxStandard?.sprite) {
            this.gfxStandard.sprite.removeListener('mouseover', this.onMouseOverCallback)
        }
        if (this.gfxOnMove?.sprite) {
            this.gfxOnMove.sprite.removeListener('mouseout', this.onMouseOutCallback)
            this.gfxOnMove.sprite.removeListener('mousedown', this.onMouseDownCallback)
            this.gfxOnMove.sprite.removeListener('mouseup', this.onMouseUpCallback)
        }
        if (this.gfxOnClick?.sprite) {
            this.gfxOnClick.sprite.removeListener('mouseout', this.onMouseOutCallback)
            this.gfxOnClick.sprite.removeListener('mouseup', this.onMouseUpCallback)
        }
    }

    onMouseOver() {
        if (this.stateMachine.getState() == States.DISABLED) {
            return
        }

        if (this.stateMachine.can(Events.OVER)) {
            this.stateMachine.dispatch(Events.OVER)
        }
        this.ONFOCUSON()
    }

    onMouseUp() {
        if (this.stateMachine.getState() == States.DISABLED) {
            return
        }

        if (this.stateMachine.can(Events.UP)) {
            this.stateMachine.dispatch(Events.UP)
        }
        this.ONRELEASED()
    }

    onMouseOut() {
        if (this.stateMachine.getState() == States.DISABLED) {
            return
        }

        if (this.stateMachine.can(Events.OUT)) {
            this.stateMachine.dispatch(Events.OUT)
        }
        this.ONFOCUSOFF()
    }

    onMouseDown() {
        if (this.stateMachine.getState() == States.DISABLED) {
            return
        }

        if (this.stateMachine.can(Events.DOWN)) {
            this.stateMachine.dispatch(Events.DOWN)
        }
        this.ONCLICKED()
    }

    ENABLE() {
        if (this.stateMachine.can(Events.ENABLE)) {
            this.stateMachine.dispatch(Events.ENABLE)
        }
    }

    DISABLE() {
        if (this.stateMachine.can(Events.DISABLE)) {
            this.stateMachine.dispatch(Events.DISABLE)
        }
    }

    DISABLEBUTVISIBLE() {
        if (this.stateMachine.can(Events.DISABLE_BUT_VISIBLE)) {
            this.stateMachine.dispatch(Events.DISABLE_BUT_VISIBLE)
        }
    }

    SETPRIORITY() {
        throw new NotImplementedError()
    }

    ONRELEASED() {
        if (this.definition.ONRELEASED) {
            this.engine.executeCallback(this, this.definition.ONRELEASED)
        }
    }

    ONCLICKED() {
        if (this.definition.ONCLICKED) {
            this.engine.executeCallback(this, this.definition.ONCLICKED)
        }
    }

    ONFOCUSON() {
        if (this.definition.ONFOCUSON) {
            this.engine.executeCallback(this, this.definition.ONFOCUSON)
        }
    }

    ONFOCUSOFF() {
        if (this.definition.ONFOCUSOFF) {
            this.engine.executeCallback(this, this.definition.ONFOCUSOFF)
        }
    }
}
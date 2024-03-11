import {Type} from './index'
import {Engine} from '../index'
import {ButtonDefinition} from '../../fileFormats/cnv/types'
import {createColorGraphics, NotImplementedError} from '../../utils'
import {Image} from './image'
import {Graphics, Rectangle} from 'pixi.js'
import {ButtonLogicComponent, State} from '../components/button'
import {Event} from '../components/button'

export class Button extends Type<ButtonDefinition> {
    private logic: ButtonLogicComponent

    private gfxStandard?: Image
    private gfxOnClick?: Image
    private gfxOnMove?: Image

    private interactArea?: Graphics
    private interactAreaDebug?: Graphics
    private interactAreaDebugEnabled?: Graphics
    private interactAreaDebugDisabled?: Graphics

    constructor(engine: Engine, definition: ButtonDefinition) {
        super(engine, definition)

        this.callbacks.register('ONFOCUSON', definition.ONFOCUSON)
        this.callbacks.register('ONFOCUSOFF', definition.ONFOCUSOFF)
        this.callbacks.register('ONCLICKED', definition.ONCLICKED)
        this.callbacks.register('ONRELEASED', definition.ONRELEASED)
        this.callbacks.register('ONINIT', definition.ONINIT)

        this.logic = new ButtonLogicComponent(
            this.onStateChange.bind(this),
            () => this.callbacks.run('ONFOCUSON'),
            () => this.callbacks.run('ONFOCUSOFF'),
            () => this.callbacks.run('ONRELEASED'),
            () => this.callbacks.run('ONCLICKED')
        )
    }

    init() {
        if (this.definition.RECT) {
            const [x1, y1, x2, y2] = this.definition.RECT
            const rect = new Rectangle(x1, y1, x2-x1, y2-y1)
            this.interactArea = createColorGraphics(rect, 0, 0)
            this.interactArea.hitArea = rect
            this.interactArea.zIndex = 9999999 - y1
            this.interactArea.visible = this.definition.ENABLE

            if (this.engine.debug) {
                this.interactAreaDebugEnabled = createColorGraphics(rect, 0, 0, 3, 0x00ff00)
                this.interactAreaDebugEnabled.zIndex = 99999999
                this.interactAreaDebug = this.logic.getState() != State.DISABLED ? this.interactAreaDebugEnabled : this.interactAreaDebugDisabled

                this.interactAreaDebugDisabled = createColorGraphics(rect, 0, 0, 3, 0xff0000)
                this.interactAreaDebugDisabled.zIndex = 99999999
            }
        }
    }

    ready() {
        if (this.interactArea) {
            this.logic.registerInteractive(this.interactArea)
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

        if (this.definition.ENABLE) {
            this.logic.enable()
        } else {
            this.logic.disable()
        }

        // ...including ONINIT
        if (this.definition.ONINIT) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }

        if (!this.interactArea) {
            if (this.gfxStandard?.sprite) {
                this.logic.registerInteractive(this.gfxStandard.sprite)
            }
            if (this.gfxOnMove?.sprite) {
                this.logic.registerInteractive(this.gfxOnMove.sprite)
            }
            if (this.gfxOnClick?.sprite) {
                this.logic.registerInteractive(this.gfxOnClick.sprite)
            }
        }
    }

    destroy() {
        if (this.interactArea) {
            this.logic.unregisterInteractive(this.interactArea)
            this.engine.app.stage.removeChild(this.interactArea)
        }
        if (this.interactAreaDebug) {
            this.engine.app.stage.removeChild(this.interactAreaDebug)
        }

        if (!this.interactArea) {
            if (this.gfxStandard?.sprite) {
                this.logic.unregisterInteractive(this.gfxStandard.sprite)
            }
            if (this.gfxOnMove?.sprite) {
                this.logic.unregisterInteractive(this.gfxOnMove.sprite)
            }
            if (this.gfxOnClick?.sprite) {
                this.logic.unregisterInteractive(this.gfxOnClick.sprite)
            }
        }
    }

    onStateChange(prevState: State, event: Event, state: State) {
        if (this.interactArea) {
            // For area button
            this.interactArea.visible = state != State.DISABLED
            this.interactArea.interactive = state != State.DISABLED

            if (this.engine.debug) {
                if (state == State.DISABLED) {
                    this.engine.app.stage.removeChild(this.interactAreaDebug!)
                    this.interactAreaDebug = this.interactAreaDebugDisabled
                    this.engine.app.stage.addChild(this.interactAreaDebug!)
                } else {
                    this.engine.app.stage.removeChild(this.interactAreaDebug!)
                    this.interactAreaDebug = this.interactAreaDebugEnabled
                    this.engine.app.stage.addChild(this.interactAreaDebug!)
                }
            }
        }

        if (state == State.DISABLED) {
            this.gfxStandard?.HIDE()
            this.gfxOnMove?.HIDE()
            this.gfxOnClick?.HIDE()
        } else if (state == State.HOVERED && this.gfxOnMove) {
            this.gfxStandard?.HIDE()
            this.gfxOnMove?.SHOW()
            this.gfxOnClick?.HIDE()
        } else if (state == State.PRESSED && this.gfxOnClick) {
            this.gfxStandard?.HIDE()
            this.gfxOnMove?.HIDE()
            this.gfxOnClick?.SHOW()
        } else {
            this.gfxStandard?.SHOW()
            this.gfxOnMove?.HIDE()
            this.gfxOnClick?.HIDE()
        }
    }

    ENABLE() {
        this.logic.enable()
    }

    DISABLE() {
        this.logic.disable()
    }

    DISABLEBUTVISIBLE() {
        this.logic.disableButVisible()
    }

    SETPRIORITY(priority: number) {
        this.gfxStandard?.SETPRIORITY(priority)
        this.gfxOnMove?.SETPRIORITY(priority)
        this.gfxOnClick?.SETPRIORITY(priority)
    }
}
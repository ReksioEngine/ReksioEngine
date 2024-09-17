import {Type} from './index'
import {Engine} from '../index'
import {ButtonDefinition} from '../../fileFormats/cnv/types'
import {createColorGraphics} from '../../utils'
import {Image} from './image'
import {Graphics, Rectangle} from 'pixi.js'
import {ButtonLogicComponent, Event, State} from '../components/button'
import {Animo} from './animo'
import {AdvancedSprite} from '../rendering'
import {assert} from '../../errors'

export class Button extends Type<ButtonDefinition> {
    private logic: ButtonLogicComponent

    private gfxStandard?: Image | Animo
    private gfxOnClick?: Image | Animo
    private gfxOnMove?: Image | Animo

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

    init() {}

    ready() {
        if (this.definition.RECT) {
            let shape
            if (Array.isArray(this.definition.RECT)) {
                shape = this.definition.RECT
            } else {
                const object = this.engine.getObject(this.definition.RECT)
                const sprite = object.getRenderObject()
                shape = [sprite.x, sprite.y, sprite.x + sprite.width, sprite.y + sprite.height]
            }

            const [x1, y1, x2, y2] = shape
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

        if (this.interactArea) {
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
        this.callbacks.run('ONINIT')
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
            if (this.gfxStandard) {
                this.unregisterInteractive(this.gfxStandard)
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
        } else if (state == State.DISABLED_BUT_VISIBLE) {
            this.gfxStandard?.SHOW()
            this.setSpriteAlpha(this.gfxStandard, 1)
            this.gfxOnMove?.HIDE()
            this.gfxOnClick?.HIDE()
        } else if (state == State.HOVERED && this.gfxOnMove) {
            this.gfxStandard?.SHOW()
            // Setting alpha to 0 instead of hiding so that the mouse interactions still work
            this.setSpriteAlpha(this.gfxStandard, 0)
            this.gfxOnMove?.SHOW()
            this.gfxOnClick?.HIDE()
        } else if (state == State.PRESSED && this.gfxOnClick) {
            this.gfxStandard?.SHOW()
            this.setSpriteAlpha(this.gfxStandard, 0)
            this.gfxOnMove?.HIDE()
            this.gfxOnClick?.SHOW()
        } else {
            this.gfxStandard?.SHOW()
            this.setSpriteAlpha(this.gfxStandard, 1)
            this.gfxOnMove?.HIDE()
            this.gfxOnClick?.HIDE()
        }

        if (event == Event.ENABLE) {
            if (this.gfxStandard) {
                this.registerInteractive(this.gfxStandard)
            }
            if (this.interactArea) {
                this.logic.registerInteractive(this.interactArea)
            }
        } else if (event == Event.DISABLE || event == Event.DISABLE_BUT_VISIBLE) {
            if (this.gfxStandard) {
                this.unregisterInteractive(this.gfxStandard)
            }
            if (this.interactArea) {
                this.logic.unregisterInteractive(this.interactArea)
            }
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

    registerInteractive(object: Image | Animo) {
        const renderObject = object.getRenderObject()
        assert(renderObject !== null)

        this.logic.registerInteractive(renderObject)

        if (renderObject instanceof AdvancedSprite) {
            renderObject.checkPixelPerfect = true
        } else if (object instanceof Image) {
            renderObject.eventMode = 'dynamic'
        }
    }

    unregisterInteractive(object: Image | Animo) {
        const renderObject = object.getRenderObject()
        assert(renderObject !== null)

        this.logic.unregisterInteractive(renderObject)

        if (renderObject instanceof AdvancedSprite) {
            renderObject.checkPixelPerfect = false
        } else if (object instanceof Image) {
            renderObject.eventMode = 'none'
        }
    }

    private setSpriteAlpha(object: Image | Animo | undefined, alpha: number) {
        if (object) {
            const renderObject = object.getRenderObject()
            if (renderObject) {
                renderObject.alpha = alpha
            }
        }
    }
}
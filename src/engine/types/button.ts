import {Type} from './index'
import {Engine} from '../index'
import {ButtonDefinition} from '../../fileFormats/cnv/types'
import {createColorGraphics, NotImplementedError} from '../../utils'
import {Image} from './image'
import {Graphics, Rectangle} from 'pixi.js'

export class Button extends Type<ButtonDefinition> {
    private enabled: boolean
    private visible: boolean

    private gfxStandard?: Image
    private gfxOnClick?: Image
    private gfxOnMove?: Image

    private interactArea?: Graphics

    private readonly onMouseOverCallback
    private readonly onMouseOutCallback
    private readonly onMouseDownCallback
    private readonly onMouseUpCallback

    private readonly onRectMouseUpCallback
    private readonly onRectMouseOverCallback
    private readonly onRectMouseOutCallback

    constructor(engine: Engine, definition: ButtonDefinition) {
        super(engine, definition)
        this.enabled = definition.ENABLE
        this.visible = definition.VISIBLE

        this.onMouseOverCallback = this.onMouseOver.bind(this)
        this.onMouseOutCallback = this.onMouseOut.bind(this)
        this.onMouseDownCallback = this.onMouseDown.bind(this)
        this.onMouseUpCallback = this.onMouseUp.bind(this)

        this.onRectMouseUpCallback = this.onRectMouseUp.bind(this)
        this.onRectMouseOverCallback = this.onRectMouseOver.bind(this)
        this.onRectMouseOutCallback = this.onRectMouseOut.bind(this)
    }

    init() {
        if (this.definition.RECT) {
            const [x, y, width, height] = this.definition.RECT
            const rect = new Rectangle(x, y, x + width, y + height)
            this.interactArea = createColorGraphics(rect, 0, 0)
            this.interactArea.interactive = true
            this.interactArea.hitArea = rect
            this.interactArea.cursor = 'pointer'
            this.interactArea.visible = this.enabled
        }

        if (this.definition.GFXSTANDARD) {
            this.gfxStandard = this.engine.getObject(this.definition.GFXSTANDARD)
        }
        if (this.definition.GFXONCLICK) {
            this.gfxOnClick = this.engine.getObject(this.definition.GFXONCLICK)
        }
        if (this.definition.GFXONMOVE) {
            this.gfxOnMove = this.engine.getObject(this.definition.GFXONMOVE)
        }

        if (this.definition.ONINIT) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }
    }

    ready() {
        this.updateVisibility(this.visible && this.enabled)

        if (this.interactArea) {
            this.interactArea.addListener('mouseup', this.onRectMouseUpCallback)
            this.interactArea.addListener('mouseover', this.onRectMouseOverCallback)
            this.interactArea.addListener('mouseout', this.onRectMouseOutCallback)
            this.engine.app.stage.addChild(this.interactArea)
        }

        if (this.gfxStandard?.sprite) {
            this.gfxStandard.sprite.interactive = true
            this.gfxStandard.sprite.cursor = 'pointer'
            this.gfxStandard.sprite.addListener('mouseover', this.onMouseOverCallback)
        }
        if (this.gfxOnMove?.sprite) {
            this.gfxOnMove.sprite.interactive = true
            this.gfxOnMove.sprite.cursor = 'pointer'
            this.gfxOnMove.sprite.addListener('mouseout', this.onMouseOutCallback)
            this.gfxOnMove.sprite.addListener('mousedown', this.onMouseDownCallback)
            this.gfxOnMove.sprite.addListener('mouseup', this.onMouseUpCallback)
        }
        if (this.gfxOnClick?.sprite) {
            this.gfxOnClick.sprite.interactive = true
            this.gfxOnClick.sprite.cursor = 'pointer'
            this.gfxOnClick.sprite.addListener('mouseout', this.onMouseOutCallback)
            this.gfxOnClick.sprite.addListener('mouseup', this.onMouseUpCallback)
        }
    }

    destroy() {
        if (this.interactArea) {
            this.interactArea.removeListener('mouseup', this.onRectMouseUpCallback)
            this.interactArea.removeListener('mouseover', this.onRectMouseOverCallback)
            this.interactArea.removeListener('mouseout', this.onRectMouseOutCallback)
            this.engine.app.stage.removeChild(this.interactArea)
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

    onRectMouseUp() {
        if (!this.enabled) return
        this.ONRELEASED()
    }

    onRectMouseOver() {
        if (!this.enabled) return
        this.ONFOCUSON()
    }

    onRectMouseOut() {
        if (!this.enabled) return
        this.ONFOCUSOFF()
    }

    onMouseOver() {
        if (!this.enabled) return
        this.gfxStandard?.HIDE()
        this.gfxOnMove?.SHOW()
        this.gfxOnClick?.HIDE()
        this.ONFOCUSON()
    }

    onMouseUp() {
        if (!this.enabled) return
        this.gfxStandard?.HIDE()
        this.gfxOnMove?.SHOW()
        this.gfxOnClick?.HIDE()

        if (this.gfxStandard?.sprite) {
            this.gfxStandard.sprite.interactive = true
        }
        if (this.gfxOnMove?.sprite) {
            this.gfxOnMove.sprite.interactive = true
        }

        this.ONRELEASED()
    }

    onMouseOut() {
        if (!this.enabled) return
        this.gfxStandard?.SHOW()
        this.gfxOnMove?.HIDE()
        this.gfxOnClick?.HIDE()

        if (this.gfxStandard?.sprite) {
            this.gfxStandard.sprite.interactive = true
        }
        if (this.gfxOnMove?.sprite) {
            this.gfxOnMove.sprite.interactive = true
        }
    }

    onMouseDown() {
        if (!this.enabled) return
        if (this.gfxOnClick) {
            this.gfxStandard?.HIDE()
            this.gfxOnMove?.HIDE()
            this.gfxOnClick?.SHOW()

            if (this.gfxStandard?.sprite) {
                this.gfxStandard.sprite.interactive = false
            }
            if (this.gfxOnMove?.sprite) {
                this.gfxOnMove.sprite.interactive = false
            }
        } else {
            this.gfxStandard?.HIDE()
            this.gfxOnMove?.SHOW()
        }
    }

    ENABLE() {
        this.enabled = true
        this.updateVisibility(true)
    }

    DISABLE() {
        this.enabled = false
        this.visible = false
        this.updateVisibility(false)
    }

    DISABLEBUTVISIBLE() {
        this.enabled = false
        this.visible = true
        this.updateVisibility(true)
    }

    SETPRIORITY() {
        throw new NotImplementedError()
    }

    private updateVisibility(state: boolean) {
        if (state) {
            this.gfxStandard?.SHOW()
        } else {
            this.gfxStandard?.HIDE()
        }
        this.gfxOnClick?.HIDE()
        this.gfxOnMove?.HIDE()

        if (this.interactArea) {
            this.interactArea.visible = state
        }
    }

    ONRELEASED() {
        if (this.definition.ONRELEASED) {
            this.engine.executeCallback(this, this.definition.ONRELEASED)
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
import {Type} from './index'
import {Engine} from '../index'
import {ButtonDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'
import {Image} from './image'

export class Button extends Type<ButtonDefinition> {
    private enabled: boolean
    private visible: boolean

    private gfxStandard?: Image
    private gfxOnClick?: Image
    private gfxOnMove?: Image

    private readonly onMouseOverCallback
    private readonly onMouseOutCallback
    private readonly onMouseDownCallback
    private readonly onMouseUpCallback

    constructor(engine: Engine, definition: ButtonDefinition) {
        super(engine, definition)
        this.enabled = definition.ENABLE
        this.visible = definition.VISIBLE

        this.onMouseOverCallback = this.onMouseOver.bind(this)
        this.onMouseOutCallback = this.onMouseOut.bind(this)
        this.onMouseDownCallback = this.onMouseDown.bind(this)
        this.onMouseUpCallback = this.onMouseUp.bind(this)
    }

    init() {
        if (this.definition.GFXSTANDARD) {
            this.gfxStandard = this.engine.getObject(this.definition.GFXSTANDARD)
        }
        if (this.definition.GFXONCLICK) {
            this.gfxOnClick = this.engine.getObject(this.definition.GFXONCLICK)
        }
        if (this.definition.GFXONMOVE) {
            this.gfxOnMove = this.engine.getObject(this.definition.GFXONMOVE)
        }
    }

    ready() {
        this.setSpritesVisibility(this.visible && this.enabled)

        if (this.gfxStandard?.sprite) {
            this.gfxStandard.sprite.interactive = true
            this.gfxStandard.sprite.addListener('mouseover', this.onMouseOverCallback)
        }
        if (this.gfxOnMove?.sprite) {
            this.gfxOnMove.sprite.interactive = true
            this.gfxOnMove.sprite.addListener('mouseout', this.onMouseOutCallback)
            this.gfxOnMove.sprite.addListener('mousedown', this.onMouseDownCallback)
            this.gfxOnMove.sprite.addListener('mouseup', this.onMouseUpCallback)
        }
        if (this.gfxOnClick?.sprite) {
            this.gfxOnClick.sprite.interactive = true
            this.gfxOnClick.sprite.addListener('mouseout', this.onMouseOutCallback)
            this.gfxOnClick.sprite.addListener('mouseup', this.onMouseUpCallback)
        }
    }

    destroy() {
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
        this.gfxStandard?.HIDE()
        this.gfxOnMove?.SHOW()
        this.gfxOnClick?.HIDE()
        this.ONFOCUSON()
    }

    onMouseUp() {
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
        this.setSpritesVisibility(true)
    }

    DISABLE() {
        this.enabled = false
        this.visible = false
        this.setSpritesVisibility(false)
    }

    DISABLEBUTVISIBLE() {
        this.enabled = false
        this.visible = true
        this.setSpritesVisibility(true)
    }

    SETPRIORITY() {
        throw new NotImplementedError()
    }

    private setSpritesVisibility(state: boolean) {
        if (state) {
            this.gfxStandard?.SHOW()
        } else {
            this.gfxStandard?.HIDE()
        }
        this.gfxOnClick?.HIDE()
        this.gfxOnMove?.HIDE()
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
}
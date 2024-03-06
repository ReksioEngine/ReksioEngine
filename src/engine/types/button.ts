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

    constructor(engine: Engine, definition: ButtonDefinition) {
        super(engine, definition)
        this.enabled = definition.ENABLE
        this.visible = definition.VISIBLE
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
        this.gfxStandard?.SHOW()
        this.gfxOnClick?.HIDE()
        this.gfxOnMove?.HIDE()

        if (this.gfxStandard?.sprite) {
            this.gfxStandard.sprite.interactive = true
            this.gfxStandard.sprite.addListener('mouseover', this.onMouseOver.bind(this))
        }
        if (this.gfxOnMove?.sprite) {
            this.gfxOnMove.sprite.interactive = true
            this.gfxOnMove.sprite.addListener('mouseout', this.onMouseOut.bind(this))
            this.gfxOnMove.sprite.addListener('mousedown', this.onMouseDown.bind(this))
            this.gfxOnMove.sprite.addListener('mouseup', this.onMouseUp.bind(this))
        }
        if (this.gfxOnClick?.sprite) {
            this.gfxOnClick.sprite.interactive = true
            this.gfxOnClick.sprite.addListener('mouseout', this.onMouseOut.bind(this))
            this.gfxOnClick.sprite.addListener('mouseup', this.onMouseUp.bind(this))
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
    }

    DISABLE() {
        this.enabled = false
        this.visible = false
    }

    DISABLEBUTVISIBLE() {
        this.enabled = false
        this.visible = true
    }

    SETPRIORITY() {
        throw new NotImplementedError()
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
import { Type, XRayInfo } from './index'
import { Engine } from '../index'
import { ButtonDefinition } from '../../fileFormats/cnv/types'
import { Image } from './image'
import { Graphics, Rectangle } from 'pixi.js'
import { ButtonLogicComponent, Event, State } from '../components/button'
import { Animo } from './animo'
import { assert } from '../../common/errors'
import { reference } from '../../fileFormats/common'
import { method } from '../../common/types'

export class Button extends Type<ButtonDefinition> {
    private logic: ButtonLogicComponent

    private gfxStandard: Image | Animo | null = null
    private gfxOnClick: Image | Animo | null = null
    private gfxOnMove: Image | Animo | null = null

    private interactArea: Graphics | null = null
    private rect: Rectangle | null = null

    constructor(engine: Engine, parent: Type<any> | null, definition: ButtonDefinition) {
        super(engine, parent, definition)
        this.logic = new ButtonLogicComponent(this.onStateChange.bind(this))
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

    applyDefaults() {
        this.prepareGraphic(this.gfxStandard)
        this.prepareGraphic(this.gfxOnClick)
        this.prepareGraphic(this.gfxOnMove)

        if (this.definition.RECT) {
            this.setRect(this.definition.RECT)
        }

        if (this.definition.ENABLE) {
            this.logic.enable()
        } else {
            this.logic.disable()
        }
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    tick() {
        this.logic.tick()
    }

    private setRect(rect: number[] | reference) {
        if (this.gfxStandard) {
            // this won't be registered ever again as the original engine prefers RECT over GFXSTANDARD
            // and there is no known way of removing the rect (neither SETSTD nor SETRECT with no/empty argument works)
            this.unregisterInteractive(this.gfxStandard)
        }

        let shape
        if (Array.isArray(rect)) {
            shape = rect
        } else {
            const object = this.engine.getObject(rect)
            assert(object !== null, 'object referred by RECT should exist')

            const sprite = object.getRenderObject()
            shape = [sprite.x, sprite.y, sprite.x + sprite.width, sprite.y + sprite.height]
        }

        const [x1, y1, x2, y2] = shape
        const rectangle = new Rectangle(x1, y1, x2 - x1, y2 - y1)

        if (this.interactArea === null) {
            this.interactArea = new Graphics()
            this.interactArea.visible = this.definition.ENABLE
            this.interactArea.name = `${this.name} (Button)` // For PIXI Devtools
            this.engine.rendering.addToStage(this.interactArea)
        }

        this.rect = rectangle
        this.interactArea.hitArea = rectangle
        this.interactArea.zIndex = 9999999 - rectangle.top
    }

    destroy() {
        if (this.interactArea) {
            this.logic.unregisterInteractive(this.interactArea)
            this.engine.rendering.removeFromStage(this.interactArea)
        } else if (this.gfxStandard) {
            this.unregisterInteractive(this.gfxStandard)
        }
    }

    private onStateChange(prevState: State, event: Event, state: State) {
        if (this.interactArea) {
            // For area button
            this.interactArea.visible = state != State.DISABLED
        }

        if (state == State.DISABLED) {
            this.gfxStandard?.HIDE()
            this.gfxOnMove?.HIDE()
            this.gfxOnClick?.HIDE()
        } else if (state == State.DISABLED_BUT_VISIBLE) {
            this.gfxStandard?.SHOW()
            this.setSpriteAlpha(this.gfxStandard, 1)

            if (this.gfxStandard !== this.gfxOnMove) {
                this.gfxOnMove?.HIDE()
            }

            if (this.gfxStandard !== this.gfxOnClick) {
                this.gfxOnClick?.HIDE()
            }
        } else if (state == State.HOVERED && this.gfxOnMove) {
            this.gfxStandard?.SHOW()

            if (this.gfxStandard !== this.gfxOnMove) {
                // Setting alpha to 0 instead of hiding so that the mouse interactions still work
                this.setSpriteAlpha(this.gfxStandard, 0)
            }

            this.gfxOnMove?.SHOW()

            if (this.gfxStandard !== this.gfxOnClick) {
                this.gfxOnClick?.HIDE()
            }
        } else if (state == State.PRESSED && this.gfxOnClick) {
            this.gfxStandard?.SHOW()

            if (this.gfxStandard !== this.gfxOnMove) {
                this.setSpriteAlpha(this.gfxStandard, 0)
                this.gfxOnMove?.HIDE()
            }

            this.gfxOnClick?.SHOW()
        } else {
            this.gfxStandard?.SHOW()
            this.setSpriteAlpha(this.gfxStandard, 1)

            if (this.gfxStandard !== this.gfxOnMove) {
                this.gfxOnMove?.HIDE()
            }

            if (this.gfxStandard !== this.gfxOnClick) {
                this.gfxOnClick?.HIDE()
            }
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
        } else if (event == Event.DOWN) {
            this.callbacks.run('ONCLICKED')
        } else if (event == Event.UP) {
            this.callbacks.run('ONRELEASED')
            this.callbacks.run('ONACTION')
        } else if (event == Event.OVER) {
            this.callbacks.run('ONFOCUSON')
        } else if (event == Event.OUT) {
            this.callbacks.run('ONFOCUSOFF')
        }
    }

    @method()
    ENABLE() {
        this.logic.enable()
    }

    @method()
    DISABLE() {
        this.logic.disable()
    }

    @method()
    DISABLEBUTVISIBLE() {
        this.logic.disableButVisible()
    }

    @method()
    SETPRIORITY(priority: number) {
        this.gfxStandard?.SETPRIORITY(priority)
        this.gfxOnMove?.SETPRIORITY(priority)
        this.gfxOnClick?.SETPRIORITY(priority)
    }

    @method()
    SETRECT(objectName: string) {
        this.setRect({ objectName })
    }

    private registerInteractive(object: Image | Animo) {
        const renderObject = object.getRenderObject()
        assert(renderObject !== null)

        this.logic.registerInteractive(renderObject)

        renderObject.checkPixelPerfect = true
        if (object instanceof Image) {
            renderObject.eventMode = 'dynamic'
        }
    }

    private unregisterInteractive(object: Image | Animo) {
        const renderObject = object.getRenderObject()
        assert(renderObject !== null)

        this.logic.unregisterInteractive(renderObject)

        renderObject.checkPixelPerfect = true
        if (object instanceof Image) {
            renderObject.eventMode = 'none'
        }
    }

    private setSpriteAlpha(object: Image | Animo | null, alpha: number) {
        if (object) {
            const renderObject = object.getRenderObject()
            if (renderObject) {
                renderObject.alpha = alpha
            }
        }
    }

    private prepareGraphic(object: Image | Animo | null) {
        const renderObject = object?.getRenderObject() ?? null
        if (renderObject === null) {
            return
        }

        // Add object to stage if it had TOCANVAS=FALSE, and wasn't added
        if (renderObject.parent === null) {
            this.engine.rendering.addToStage(renderObject)
        }
    }

    __getXRayInfo(): XRayInfo | null {
        if (this.rect !== null) {
            return {
                type: 'button',
                bounds: this.rect,
                color: this.logic.enabled ? 0x00ff00 : 0x0000ff,
                position: 'outside',
                visible: this.logic.state != State.DISABLED,
            }
        } else if (this.gfxStandard?.getRenderObject()?.visible) {
            return {
                type: 'button',
                bounds: this.gfxStandard.getRenderObject()!.getBounds(),
                color: this.logic.enabled ? 0x00ff00 : 0x0000ff,
                position: 'outside',
                visible: this.gfxStandard.getRenderObject()?.visible ?? false,
            }
        }
        return null
    }
}

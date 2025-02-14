import { DisplayType, Type } from './index'
import { TextDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import * as PIXI from 'pixi.js'
import { method } from '../../common/types'

export class Text extends DisplayType<TextDefinition> {
    private readonly text: PIXI.Text

    constructor(engine: Engine, parent: Type<any> | null, definition: TextDefinition) {
        super(engine, parent, definition)
        this.text = new PIXI.Text('', { fontFamily: 'Arial' })
    }

    ready() {
        const [x, y, width, height] = this.definition.RECT

        this.text.x = x
        this.text.y = y
        this.text.visible = this.engine.debug.enabled
        this.engine.rendering.addToStage(this.text)
    }

    destroy() {
        this.engine.rendering.removeFromStage(this.text)
    }

    @method()
    SETTEXT(content: string) {
        this.text.text = content
    }

    getRenderObject() {
        return this.text
    }
}

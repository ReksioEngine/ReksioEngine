import { DisplayType } from './index'
import { TextDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import * as PIXI from 'pixi.js'
import { method } from '../../types'

export class Text extends DisplayType<TextDefinition> {
    private readonly text: PIXI.Text

    constructor(engine: Engine, definition: TextDefinition) {
        super(engine, definition)
        this.text = new PIXI.Text('', { fontFamily: 'Arial' })
    }

    ready() {
        const [x, y, width, height] = this.definition.RECT

        this.text.x = x
        this.text.y = y
        this.text.visible = this.engine.debug.isDebug
        this.engine.addToStage(this.text)
    }

    destroy() {
        this.engine.removeFromStage(this.text)
    }

    @method()
    SETTEXT(content: string) {
        this.text.text = content
    }

    getRenderObject() {
        return this.text
    }
}

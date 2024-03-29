import {DisplayType} from './index'
import {TextDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import * as PIXI from 'pixi.js'

export class Text extends DisplayType<TextDefinition> {
    private readonly text: PIXI.Text

    constructor(engine: Engine, definition: TextDefinition) {
        super(engine, definition)
        this.text = new PIXI.Text('TEST', {fontFamily: 'Arial'})
    }

    ready() {
        const [x, y, width, height] = this.definition.RECT

        this.text.x = x
        this.text.y = y
        this.text.width = width
        this.text.height = height
        this.engine.addToStage(this.text)
    }

    destroy() {
        this.engine.removeFromStage(this.text)
    }

    getRenderObject() {
        return this.text
    }
}

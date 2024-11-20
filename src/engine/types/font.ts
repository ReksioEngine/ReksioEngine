import { Type } from './index'
import { FontDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'

export class Font extends Type<FontDefinition> {
    constructor(engine: Engine, definition: FontDefinition) {
        super(engine, definition)
    }
}

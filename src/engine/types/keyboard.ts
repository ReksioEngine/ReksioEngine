import {Type} from './index'
import {KeyboardDefinition, MusicDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'

export class Keyboard extends Type<KeyboardDefinition> {
    constructor(engine: Engine, definition: MusicDefinition) {
        super(engine, definition)
    }

    // UP, DOWN, RIGHT, LEFT
    ISKEYDOWN(keyName: string) {
        throw NotImplementedError
    }
}

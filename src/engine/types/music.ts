import {Type} from './index'
import {MusicDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'

export class Music extends Type<MusicDefinition> {
    constructor(engine: Engine, definition: MusicDefinition) {
        super(engine, definition)
    }
}

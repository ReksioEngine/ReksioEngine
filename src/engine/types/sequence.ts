import {Type} from './index'
import {Engine} from '../index'
import {SequenceDefinition} from '../../fileFormats/cnv/types'

export class Sequence extends Type<SequenceDefinition> {
    constructor(engine: Engine, definition: SequenceDefinition) {
        super(engine, definition)
    }
}

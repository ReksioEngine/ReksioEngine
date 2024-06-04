import {Type} from './index'
import {RandDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'

export class Rand extends Type<RandDefinition> {
    constructor(engine: Engine, definition: RandDefinition) {
        super(engine, definition)
    }
}

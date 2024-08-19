import {ValueType} from './index'
import {VectorDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'

export class Vector extends ValueType<VectorDefinition> {
    constructor(engine: Engine, definition: VectorDefinition) {
        super(engine, definition)
    }
}

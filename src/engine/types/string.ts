import {Type} from './index'
import {Engine} from '../index'
import {StringDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'

export class String extends Type<StringDefinition> {
    constructor(engine: Engine, definition: StringDefinition) {
        super(engine, definition)
    }

    ADD() {
        throw new NotImplementedError()
    }

    SET() {
        throw new NotImplementedError()
    }
}

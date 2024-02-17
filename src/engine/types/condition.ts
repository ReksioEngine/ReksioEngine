import {Type} from './index'
import {ConditionDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'

export class Condition extends Type<ConditionDefinition> {
    constructor(engine: Engine, definition: ConditionDefinition) {
        super(engine, definition)
    }

    BREAK(arg: boolean) {
        throw NotImplementedError
    }

    ONE_BREAK(arg: boolean) {
        throw NotImplementedError
    }

    CHECK(arg: boolean) {
        throw NotImplementedError
    }
}

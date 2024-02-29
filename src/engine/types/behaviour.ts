import {Type} from './index'
import {Engine} from '../index'
import {BehaviourDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'

export class Behaviour extends Type<BehaviourDefinition> {
    constructor(engine: Engine, definition: BehaviourDefinition) {
        super(engine, definition)
    }

    RUN(...args: any[]) {
        return this.engine.executeCallback(this, this.definition.CODE)
    }

    RUNC() {
        throw NotImplementedError
    }

    RUNLOOPED() {
        throw NotImplementedError
    }
}

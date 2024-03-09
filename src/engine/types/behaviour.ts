import {Type} from './index'
import {Engine} from '../index'
import {BehaviourDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'
import {Condition} from './condition'

export class Behaviour extends Type<BehaviourDefinition> {
    constructor(engine: Engine, definition: BehaviourDefinition) {
        super(engine, definition)
    }

    ready() {
        if (this.definition.NAME === '__INIT__') {
            this.RUN()
        }
    }

    RUN(...args: any[]) {
        return this.engine.executeCallback(null, this.definition.CODE)
    }

    RUNC(...args: any[]) {
        if (this.definition.CONDITION) {
            const condition: Condition = this.engine.getObject(this.definition.CONDITION.objectName)
            if (!condition.CHECK(true)) {
                return
            }
        }
        return this.RUN(...args)
    }

    RUNLOOPED(init: number, len: number, step: number, ...args: any[]) {
        for (let i = init; i < len; i += step) {
            this.RUNC(...args)
        }
    }
}

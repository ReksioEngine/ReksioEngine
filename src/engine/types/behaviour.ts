import {Type} from './index'
import {Engine} from '../index'
import {BehaviourDefinition} from '../../fileFormats/cnv/types'
import {Condition} from './condition'
import {CodeSource} from '../debugging'

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
        return this.engine.executeCallback(null, new CodeSource(this, 'CODE'), this.definition.CODE, args)
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

    RUNLOOPED(init: number, len: number, step: number = 1, ...args: any[]) {
        for (let i = init; i < len; i += step) {
            this.RUNC(i + 1, ...args)
        }
    }
}

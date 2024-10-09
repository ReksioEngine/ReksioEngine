import {Type} from './index'
import {Engine} from '../index'
import {BehaviourDefinition} from '../../fileFormats/cnv/types'
import {Condition} from './condition'
import {InterruptScriptExecution} from '../../interpreter/evaluator'

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
        try {
            return this.engine.executeCallback(null, this.definition.CODE, args)
        } catch (err) {
            if (!(err instanceof InterruptScriptExecution)) {
                throw err
            }
        }
    }

    RUNC(...args: any[]) {
        if (!this.shouldRun()) {
            return
        }

        return this.RUN(...args)
    }

    RUNLOOPED(init: number, len: number, step: number = 1, ...args: any[]) {
        const resolvedArgs = args.map((arg) => {
            if (typeof arg !== 'string') {
                return arg
            }

            const result = this.engine.runScript(arg.toString(), [], true, false)
            return result !== null ? result : arg
        })

        for (let i = init; i < len; i += step) {
            try {
                if (!this.shouldRun()) {
                    continue
                }

                this.engine.executeCallback(null, this.definition.CODE, [i, step, ...resolvedArgs])
            } catch (err) {
                if (err instanceof InterruptScriptExecution) {
                    if (err.one) {
                        continue
                    } else {
                        break
                    }
                } else {
                    throw err
                }
            }
        }
    }

    shouldRun() {
        if (this.definition.CONDITION) {
            const condition: Condition = this.engine.getObject(this.definition.CONDITION.objectName)
            return condition.CHECK(true)
        }
        return true
    }
}

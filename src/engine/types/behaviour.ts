import { Type } from './index'
import { BehaviourDefinition } from '../../fileFormats/cnv/types'
import { Condition } from './condition'
import { InterruptScriptExecution } from '../../interpreter/script'
import { method } from '../../common/types'

export class Behaviour extends Type<BehaviourDefinition> {
    ready() {
        if (this.definition.NAME === '__INIT__') {
            this.RUN()
        }
    }

    @method()
    RUN(...args: any[]) {
        try {
            this.executeCallback(args)
        } catch (err) {
            if (!(err instanceof InterruptScriptExecution)) {
                throw err
            }
        }
    }

    @method()
    RUNC(...args: any[]) {
        if (this.shouldRun()) {
            this.RUN(...args)
        }
    }

    @method()
    RUNLOOPED(start: number, len: number, step: number = 1, ...args: any[]) {
        const resolvedArgs = this.resolveArgs(args)

        for (let i = start; i < start + len; i += step) {
            try {
                if (this.shouldRun()) {
                    this.engine.scripting.executeCallback(null, this.definition.CODE, [i, step, ...resolvedArgs])
                }
            } catch (err) {
                if (err instanceof InterruptScriptExecution) {
                    if (err.one) {
                        continue
                    } else {
                        break
                    }
                }
                throw err
            }
        }
    }

    private resolveArgs(args: any[]) {
        return args.map((arg) => {
            if (typeof arg !== 'string') {
                return arg
            }

            const result = this.engine.scripting.runScript(arg.toString(), [], true, false)
            return result !== null && result !== undefined ? result : arg
        })
    }

    executeCallback(args: any[] = []) {
        // Don't resolve args, it will fail in S33_METEORY
        return this.engine.scripting.executeCallback(null, this.definition.CODE, args)
    }

    executeConditionalCallback(args: any[] = []) {
        if (this.shouldRun()) {
            this.executeCallback(args)
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

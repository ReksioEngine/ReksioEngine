import { Type } from './index'
import { BehaviourDefinition } from '../../fileFormats/cnv/types'
import { Condition } from './condition'
import { InterruptScriptExecution } from '../../interpreter/script'
import { method } from '../../common/types'

export class Behaviour extends Type<BehaviourDefinition> {
    async ready() {
        if (this.definition.NAME === '__INIT__') {
            await this.RUN()
        }
    }

    @method()
    async RUN(...args: any[]) {
        try {
            await this.executeCallback(args)
        } catch (err) {
            if (!(err instanceof InterruptScriptExecution)) {
                throw err
            }
        }
    }

    @method()
    async RUNC(...args: any[]) {
        if (await this.shouldRun()) {
            await this.RUN(...args)
        }
    }

    @method()
    async RUNLOOPED(start: number, len: number, step: number = 1, ...args: any[]) {
        for (let i = start; i < start + len; i += step) {
            try {
                if (await this.shouldRun()) {
                    await this.engine.scripting.executeCallback(null, this.definition.CODE, [i, step, ...args])
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

    async executeCallback(args: any[] = []) {
        // Don't resolve args, it will fail in S33_METEORY
        return await this.engine.scripting.executeCallback(null, this.definition.CODE, args)
    }

    async executeConditionalCallback(args: any[] = []) {
        if (await this.shouldRun()) {
            await this.executeCallback(args)
        }
    }

    async shouldRun() {
        if (this.definition.CONDITION) {
            const condition: Condition = this.engine.getObject(this.definition.CONDITION.objectName)
            return await condition.CHECK(true)
        }
        return true
    }
}

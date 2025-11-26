import { Type } from './index'
import { BehaviourDefinition } from '../../fileFormats/cnv/types'
import { Condition } from './condition'
import { InterruptScriptExecution } from '../../interpreter/script'
import { method } from '../../common/types'
import { assert } from '../../common/errors'
import { ClassInstance } from './class'
import { printStackTrace } from '../../interpreter/script/stacktrace'

export class Behaviour extends Type<BehaviourDefinition> {
    async ready() {
        if (this.definition.NAME === '__INIT__') {
            await this.RUN()
        }

        if (this.definition.NAME === 'CONSTRUCTOR') {
            assert(this.parent !== null && this.parent instanceof ClassInstance)
            await this.RUN(...this.parent.args)
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
                    await this.engine.scripting.executeCallback(null, this, this.definition.CODE, [i, step, ...args])
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
        // TODO: Cleanup here after Matrix is fixed
        // if(this.name.includes("BEHENEXPLODE"))
        // {
        //     console.log("START")
        // }

        // console.log(this.name,"START")

        let res = await this.engine.scripting.executeCallback(null, this, this.definition.CODE, args)

        // console.log(this.name,"DONE")

        // if(this.name.includes("BEHENEXPLODE"))
        // {
        //     console.log("DONE")
        // }

        return res
    }

    async executeConditionalCallback(args: any[] = []) {
        if (await this.shouldRun()) {
            await this.executeCallback(args)
        }
    }

    async shouldRun() {
        if (this.definition.CONDITION) {
            const condition: Condition | null = this.getObject(this.definition.CONDITION.objectName)
            assert(condition !== null)
            return await condition.CHECK(true)
        }
        return true
    }
}

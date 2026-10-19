import { Type } from './index'
import { BehaviourDefinition } from '../../fileFormats/cnv/types'
import { Condition } from './condition'
import { method, int } from '../../common/types'
import { assert, InterruptScriptExecution } from '../../common/errors'
import { ClassInstance } from './class'
import { createInteger } from './values'
import { captureStackTrace, popStackFrame, pushStackFrame, StackFrame } from '../../interpreter/stacktrace'

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
    async RUN(...args: any[]): Promise<any> {
        try {
            return await this.executeCallback(args)
        } catch (err) {
            if (!(err instanceof InterruptScriptExecution)) {
                throw err
            }
        }
    }

    @method()
    async RUNC(...args: any[]) {
        if (await this.shouldRun()) {
            return await this.RUN(...args)
        }
    }

    @method()
    async RUNLOOPED(start: int, len: int, step: int = 1, ...args: any[]) {
        for (let i = start; i < start + len; i += step) {
            try {
                if (await this.shouldRun()) {
                    await this.executeCallback([
                        createInteger(this.engine, i),
                        createInteger(this.engine, step),
                        ...args,
                    ])
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

    async executeCallback(args: any[] = []): Promise<any> {
        try {
            pushStackFrame(
                StackFrame.builder()
                    .type('behaviour')
                    .behaviour(this.name)
                    .args(...args)
                    .build()
            )

            return await this.engine.scripting.executeCallback(null, this, this.definition.CODE, args)
        } catch (err) {
            captureStackTrace(err)
            throw err
        } finally {
            popStackFrame()
        }
    }

    async executeConditionalCallback(args: any[] = []) {
        if (await this.shouldRun()) {
            return await this.executeCallback(args)
        }
    }

    async shouldRun() {
        if (this.definition.CONDITION) {
            const condition = this.getObject<Condition>(this.definition.CONDITION.objectName)
            assert(condition !== null)
            return await condition.check(true)
        }
        return true
    }
}

import { callback } from '../fileFormats/common'
import { runScript } from '../interpreter/script'
import { Type } from './types'
import { StackFrame, stackTrace } from '../interpreter/script/stacktrace'
import { Engine } from './index'

export class ScriptingManager {
    private readonly engine: Engine
    private thisQueue: Type<any>[] = []

    constructor(engine: Engine) {
        this.engine = engine
    }

    get currentThis() {
        return this.thisQueue[this.thisQueue.length - 1]
    }

    executeCallback(caller: Type<any> | null, callback: callback, args?: any[]) {
        if (caller !== null) {
            this.thisQueue.push(caller)
        }

        let stackFrame = null
        try {
            if (callback.code) {
                return runScript(this.engine, callback.code, args, callback.isSingleStatement, true)
            } else if (callback.behaviourReference) {
                if (!this.engine.scope[callback.behaviourReference]) {
                    console.error(
                        `Trying to execute behaviour "${callback.behaviourReference}" that doesn't exist!\n\n%cCallback:%c%O\n%cCaller:%c%O`,
                        'font-weight: bold',
                        'font-weight: inherit',
                        callback,
                        'font-weight: bold',
                        'font-weight: inherit',
                        caller
                    )
                    return
                }

                stackFrame = StackFrame.builder()
                    .type('behaviour')
                    .behaviour(callback.behaviourReference)
                    .args(...(args !== undefined ? args : []))
                    .build()

                stackTrace.push(stackFrame)
                return this.engine.scope[callback.behaviourReference].RUNC(...callback.constantArguments)
            }
        } finally {
            if (caller !== null) {
                this.thisQueue.pop()
            }

            if (stackFrame !== null) {
                stackTrace.pop()
            }
        }
    }

    runScript(code: string, args: any[], isSingleStatement: boolean, printDebug: boolean) {
        return runScript(this.engine, code, args, isSingleStatement, printDebug)
    }
}

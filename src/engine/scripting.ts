import { callback } from '../fileFormats/common'
import { runScript } from '../interpreter/script'
import { Type } from './types'
import { StackFrame, stackTrace } from '../interpreter/script/stacktrace'
import { Engine } from './index'
import { Scope } from './scope'

export class ScriptingManager {
    private readonly engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
    }

    async executeCallback(
        caller: Type<any> | null,
        callback: callback,
        args?: any[],
        localScopeEntries?: Record<string, any>,
        forwardInterrupts: boolean = false
    ) {
        let stackFrame = null
        try {
            const localScope = new Scope(
                'local',
                localScopeEntries ? new Map(Object.entries(localScopeEntries)) : undefined
            )
            if (caller !== null) {
                localScope.set('THIS', caller)
            }
            this.engine.scopeManager.pushScope(localScope)

            if (callback.code) {
                return await runScript(this.engine, callback.code, args, callback.isSingleStatement, true)
            } else if (callback.behaviourReference) {
                if (!this.engine.getObject(callback.behaviourReference)) {
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

                const behaviour = this.engine.getObject(callback.behaviourReference)
                if (forwardInterrupts) {
                    return await behaviour.executeConditionalCallback(callback.constantArguments)
                } else {
                    return await behaviour.RUNC(...callback.constantArguments)
                }
            }
        } finally {
            this.engine.scopeManager.popScope()
            if (stackFrame !== null) {
                stackTrace.pop()
            }
        }
    }

    runScript(code: string, args: any[], isSingleStatement: boolean, printDebug: boolean) {
        return runScript(this.engine, code, args, isSingleStatement, printDebug)
    }
}

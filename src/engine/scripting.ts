import { callback } from '../fileFormats/common'
import { Type } from './types'
import { Engine } from './index'
import { Scope } from './scope'
import { Behaviour } from './types/behaviour'
import { assert } from '../common/errors'
import { logger } from './logging'
import { runCode } from '../interpreter'

export class ScriptingManager {
    private readonly engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
    }

    async executeCallback(
        thisRef: Type<any> | null,
        caller: Type<any> | null,
        callback: callback,
        args?: any[],
        localScopeEntries?: Record<string, any>,
        forwardInterrupts: boolean = false
    ) {
        try {
            const localScope = new Scope(
                'local',
                localScopeEntries ? new Map(Object.entries(localScopeEntries)) : undefined
            )
            if (thisRef !== null) {
                localScope.set('THIS', thisRef)
            }
            this.engine.scopeManager.pushLocalScope(localScope)

            if (callback.code !== undefined) {
                return await runCode(this.engine, caller, callback.code, args ?? [], callback.isSingleStatement)
            } else if (callback.behaviourReference !== undefined) {
                const behaviour = this.engine.getObject<Behaviour>(callback.behaviourReference, caller?.parentScope)
                if (!behaviour) {
                    logger.error(`Trying to execute behaviour "${callback.behaviourReference}" that doesn't exist!`, {
                        callback,
                        thisRef,
                    })
                    return
                }

                if (forwardInterrupts) {
                    return await behaviour.executeConditionalCallback(args ?? callback.constantArguments)
                } else {
                    return await behaviour.RUNC(...(args ?? callback.constantArguments))
                }
            }
        } finally {
            this.engine.scopeManager.popLocalScope()
        }
    }
}

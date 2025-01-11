import { callback, callbacks, FieldTypeEntry } from '../../fileFormats/common'
import { Engine } from '../index'
import { Type } from '../types'
import { assert } from '../../errors'
import { InterruptScriptExecution } from '../../interpreter/script/evaluator'
import { StackFrame, stackTrace } from '../../interpreter/script/stacktrace'
import { structureDefinitions } from '../../fileFormats/cnv/types'

export class CallbacksComponent {
    private readonly engine: Engine
    private readonly object: Type<any>

    private registry: Map<string, callbacks<any>> = new Map<string, callbacks<any>>()

    constructor(engine: Engine, object: Type<any>) {
        this.engine = engine
        this.object = object
    }

    private registerGroup(type: string, callbacks: callbacks<any>) {
        this.registry.set(type, callbacks)
    }

    private register(type: string, callback: callback) {
        this.registry.set(type, {
            nonParametrized: callback,
            parametrized: new Map<any, callback>(),
        })
    }

    autoRegister() {
        const structure = structureDefinitions[this.object.definition.TYPE]
        for (const [key, value] of Object.entries(structure)) {
            const fieldDefinition = value as FieldTypeEntry

            const callback = this.object.definition[key]
            if (callback === undefined) {
                continue
            }

            if (fieldDefinition.name === 'callback') {
                this.register(key, callback)
            } else if (fieldDefinition.name === 'callbacks') {
                this.registerGroup(key, callback)
            }
        }
    }

    has(type: string): boolean {
        if (!this.registry.has(type)) {
            return false
        }
        const callbacks = this.registry.get(type)
        assert(callbacks !== undefined)

        return callbacks.nonParametrized !== null || callbacks.parametrized.size > 0
    }

    run(type: string, param?: any, thisOverride?: Type<any> | null) {
        if (!this.has(type)) {
            return
        }

        const stackFrame = StackFrame.builder()
            .type('callback')
            .object(this.object)
            .callback(type)
            .args(...(param !== undefined && param !== null ? [param] : []))
            .build()
        stackTrace.push(stackFrame)

        const thisReference = thisOverride !== undefined ? thisOverride : this.object

        try {
            const callbackGroup = this.registry.get(type)
            assert(callbackGroup !== undefined)

            if (param !== null && param !== undefined && callbackGroup.parametrized.has(param)) {
                const callback = callbackGroup.parametrized.get(param)
                assert(callback !== undefined, 'Callbacks should not happen to be undefined values')
                this.engine.executeCallback(thisReference, callback)
            } else if (callbackGroup.nonParametrized) {
                this.engine.executeCallback(thisReference, callbackGroup.nonParametrized)
            }
        } catch (err) {
            if (!(err instanceof InterruptScriptExecution)) {
                throw err
            }
        } finally {
            stackTrace.pop()
        }
    }

    addBehaviour(callbackString: string, behaviourName: string) {
        const [callbackName, callbackParam] = callbackString.split('$')

        const newEntry = this.registry.get(callbackName) ?? {
            nonParametrized: null,
            parametrized: new Map(),
        }

        const newCallback = {
            isSingleStatement: false,
            behaviourReference: behaviourName,
            constantArguments: [],
        }

        if (callbackParam == undefined) {
            newEntry.nonParametrized = newCallback
        } else {
            newEntry.parametrized.set(callbackParam, newCallback)
        }

        this.registry.set(callbackName, newEntry)
    }
}

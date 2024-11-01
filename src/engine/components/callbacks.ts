import {callback, callbacks} from '../../fileFormats/common'
import {Engine} from '../index'
import {Type} from '../types'
import {assert} from '../../errors'
import {InterruptScriptExecution} from '../../interpreter/evaluator'
import {StackFrame, stackTrace} from '../../interpreter/stacktrace'

export class CallbacksComponent {
    private readonly engine: Engine
    private readonly object: Type<any>

    public registry: Map<string, callbacks<any>> = new Map<string, callbacks<any>>()

    constructor(engine: Engine, object: Type<any>) {
        this.engine = engine
        this.object = object
    }

    registerGroup(type: string, callbacks?: callbacks<any>) {
        if (callbacks) {
            this.registry.set(type, {
                nonParametrized: callbacks.nonParametrized,
                parametrized: callbacks.parametrized && new Map(callbacks.parametrized)
            })
        } else {
            this.registry.set(type, {
                nonParametrized: null,
                parametrized: new Map()
            })
        }
    }

    register(type: string, callback?: callback) {
        this.registry.set(type, {
            nonParametrized: callback ?? null,
            parametrized: new Map<any, callback>()
        })
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
        const thisReference = thisOverride !== undefined ? thisOverride : this.object

        const stackFrame = StackFrame.builder()
            .type('callback')
            .object(this.object)
            .callback(type)
            .args(...(param !== undefined ? [param] : []))
            .build()
        stackTrace.push(stackFrame)

        try {
            const callbackGroup = this.registry.get(type)
            if (callbackGroup?.nonParametrized) {
                this.engine.executeCallback(thisReference, callbackGroup.nonParametrized)
            }

            if (param !== null && param !== undefined && callbackGroup?.parametrized.has(param)) {
                this.engine.executeCallback(thisReference, callbackGroup.parametrized.get(param)!)
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
        const callbackGroup = this.registry.get(callbackName)!

        const newCallback = {
            isSingleStatement: false,
            behaviourReference: behaviourName,
            constantArguments: []
        }

        if (callbackParam) {
            callbackGroup.parametrized.set(callbackParam, newCallback)
        } else {
            callbackGroup.nonParametrized = newCallback
        }
    }
}

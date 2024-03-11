import {callback, callbacks} from '../../fileFormats/common'
import {Engine} from '../index'
import {Type} from '../types'

export class CallbacksComponent {
    private readonly engine: Engine
    private readonly object: Type<any>

    private callbacks: Map<string, callbacks<any>> = new Map<string, callbacks<any>>()

    constructor(engine: Engine, object: Type<any>) {
        this.engine = engine
        this.object = object
    }

    registerGroup(type: string, callbacks?: callbacks<any>) {
        if (callbacks) {
            this.callbacks.set(type, {
                nonParametrized: callbacks.nonParametrized,
                parametrized: callbacks.parametrized && new Map(callbacks.parametrized)
            })
        } else {
            this.callbacks.set(type, {
                nonParametrized: null,
                parametrized: new Map()
            })
        }
    }

    register(type: string, callback?: callback) {
        this.callbacks.set(type, {
            nonParametrized: callback ?? null,
            parametrized: new Map<any, callback>()
        })
    }

    run(type: string, param?: any) {
        const callbackGroup = this.callbacks.get(type)
        if (callbackGroup?.nonParametrized) {
            this.engine.executeCallback(this.object, callbackGroup.nonParametrized)
        }

        if (param !== undefined && callbackGroup?.parametrized.has(param)) {
            this.engine.executeCallback(this.object, callbackGroup.parametrized.get(param)!)
        }
    }

    addBehaviour(callbackString: string, behaviourName: string) {
        const [callbackName, callbackParam] = callbackString.split('$')
        const callbackGroup = this.callbacks.get(callbackName)!

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

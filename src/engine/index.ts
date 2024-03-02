import {getCNVFile} from '../filesLoader'
import {callback} from '../fileFormats/cnv/types'
import {runScript} from '../interpreter/evaluator'
import {Type} from './types'
import {loadDefinition} from './definitionLoader'
import {Application} from 'pixi.js'
import {Scene} from './types/scene'

export class Engine {
    readonly app: Application

    public scope: Record<string, any> = {}
    public currentScene: Scene | null = null

    constructor(app: Application) {
        this.app = app
    }

    async init() {
        const applicationDef = await getCNVFile('DANE/Application.def')
        await loadDefinition(this, applicationDef)

        // @ts-ignore
        globalThis.engine = this
    }

    tick(delta: number) {
        for (const object of Object.values(this.scope)) {
            object.tick(delta)
        }
    }

    executeCallback(caller: Type<any> | null, callback: callback) {
        this.scope.THIS = caller

        if (callback.code) {
            return runScript(caller, this.scope, callback.code, callback.isSingleStatement)
        } else if (callback.behaviourReference) {
            return this.scope[callback.behaviourReference].RUN()
        }
    }

    getObject(name: string) {
        return this.scope[name]
    }
}

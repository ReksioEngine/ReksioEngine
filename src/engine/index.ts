import {getCNVFile} from '../filesLoader'
import {callback} from '../fileFormats/cnv/types'
import {runScript} from '../interpreter/evaluator'
import {Type} from './types'
import {loadScene} from './sceneLoader'
import {Application} from 'pixi.js'

export class Engine {
    readonly app: Application
    public scope: Record<string, any> = {}

    constructor(app: Application) {
        this.app = app
    }

    async init() {
        const applicationDef = await getCNVFile('DANE/Application.def')
        loadScene(this, applicationDef)

        // @ts-ignore
        globalThis.engine = this
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

import {callback} from '../fileFormats/cnv/types'
import {runScript} from '../interpreter/evaluator'
import {Type} from './types'
import {loadDefinition} from './definitionLoader'
import {Application, Sprite} from 'pixi.js'
import {Scene} from './types/scene'
import {FileLoader, GithubFileLoader} from '../filesLoader'

export class Engine {
    readonly app: Application

    public scope: Record<string, any> = {}
    public currentScene: Scene | null = null

    public fileLoader: FileLoader = new GithubFileLoader('reksioiufo')

    constructor(app: Application) {
        this.app = app
    }

    async init() {
        const applicationDef = await this.fileLoader.getCNVFile('DANE/Application.def')
        await loadDefinition(this, applicationDef)

        this.app.stage.sortableChildren = true;

        // @ts-ignore
        globalThis.engine = this
    }

    tick(delta: number) {
        for (const object of Object.values(this.scope)) {
            object.tick(delta)
        }
    }

    executeCallback(caller: Type<any> | null, callback: callback) {
        if (caller !== null) {
            this.scope.THIS = caller
        }

        if (callback.code) {
            return runScript(caller, this.scope, callback.code, callback.isSingleStatement)
        } else if (callback.behaviourReference) {
            return this.scope[callback.behaviourReference].RUN()
        }
    }

    addToStage(sprite: Sprite) {
        sprite.sortableChildren = true;

        this.app.stage.addChild(sprite)
    }

    getObject(name: string) {
        return this.scope[name]
    }
}

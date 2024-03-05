import {callback} from '../fileFormats/cnv/types'
import {runScript} from '../interpreter/evaluator'
import {Type} from './types'
import {loadDefinition} from './definitionLoader'
import {Application} from 'pixi.js'
import {Scene} from './types/scene'
import {FileLoader, GithubFileLoader} from '../filesLoader'
import {Sound} from '@pixi/sound'
import {loadSound} from './assetsLoader'

export class Engine {
    readonly app: Application

    public scope: Record<string, any> = {}
    public currentScene: Scene | null = null

    public fileLoader: FileLoader = new GithubFileLoader('reksioiufo')
    public music: Sound | null = null

    constructor(app: Application) {
        this.app = app
    }

    async init() {
        const applicationDef = await this.fileLoader.getCNVFile('DANE/Application.def')
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
        if (caller !== null) {
            this.scope.THIS = caller
        }

        if (callback.code) {
            return runScript(caller, this.scope, callback.code, callback.isSingleStatement)
        } else if (callback.behaviourReference) {
            return this.scope[callback.behaviourReference].RUN()
        }
    }

    async changeScene(sceneName: string) {
        this.app.ticker.stop()
        if (this.music != null) {
            this.music.stop()
        }

        for (const object of Object.values(this.scope)) {
            object.destroy()
        }

        this.currentScene = this.getObject(sceneName) as Scene
        const sceneDefinition = await this.fileLoader.getCNVFile(this.currentScene.getRelativePath(`${sceneName}.cnv`))
        await loadDefinition(this, sceneDefinition)

        this.music = await loadSound(this.fileLoader, this.currentScene.definition.MUSIC, {
            loop: true
        })
        this.music.play()

        this.app.ticker.start()
    }

    getObject(name: string) {
        return this.scope[name]
    }
}

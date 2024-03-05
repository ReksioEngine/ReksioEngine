import {callback} from '../fileFormats/cnv/types'
import {runScript} from '../interpreter/evaluator'
import {Type} from './types'
import {loadDefinition} from './definitionLoader'
import {Application, Sprite} from 'pixi.js'
import {Scene} from './types/scene'
import {FileLoader, GithubFileLoader} from '../filesLoader'
import {Sound} from '@pixi/sound'
import {loadSound} from './assetsLoader'

export class Engine {
    readonly app: Application

    public globalScope: Record<string, any> = {}
    public scope: Record<string, any> = {}
    public currentScene: Scene | null = null

    public fileLoader: FileLoader = new GithubFileLoader('reksioiufo')
    public music: Sound | null = null

    constructor(app: Application) {
        this.app = app
    }

    async init() {
        const applicationDef = await this.fileLoader.getCNVFile('DANE/Application.def')
        await loadDefinition(this, this.globalScope, applicationDef)

        this.app.stage.sortableChildren = true

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
            return runScript(this, callback.code, callback.isSingleStatement)
        } else if (callback.behaviourReference) {
            return this.scope[callback.behaviourReference].RUN()
        }
    }

    addToStage(sprite: Sprite) {
        sprite.sortableChildren = true

        this.app.stage.addChild(sprite)
    }

    async changeScene(sceneName: string) {
        this.app.ticker.stop()
        if (this.music != null) {
            this.music.stop()
        }

        // Remove non-global scope objects
        for (const [key, object] of Object.entries(this.scope)) {
            object.destroy()
            delete this.scope[key]
        }

        this.currentScene = this.getObject(sceneName) as Scene
        const sceneDefinition = await this.fileLoader.getCNVFile(this.currentScene.getRelativePath(`${sceneName}.cnv`))
        await loadDefinition(this, this.scope, sceneDefinition)

        this.music = await loadSound(this.fileLoader, this.currentScene.definition.MUSIC, {
            loop: true
        })
        this.music.play()

        this.app.ticker.start()
    }

    getObject(name: string) {
        return this.scope[name] ?? this.globalScope[name]
    }
}

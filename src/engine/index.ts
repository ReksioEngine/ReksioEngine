import {callback, reference} from '../fileFormats/common'
import {runScript} from '../interpreter/evaluator'
import {Type} from './types'
import {loadDefinition} from './definitionLoader'
import {Application, Sprite} from 'pixi.js'
import {Scene} from './types/scene'
import {FileLoader, GithubFileLoader, UrlFileLoader} from '../filesLoader'
import {sound, Sound} from '@pixi/sound'
import {loadSound, loadTexture} from './assetsLoader'
import {SaveFile} from './saveFile'
import {createColorSprite} from '../utils'
import {preloadAssets} from './optimizations'

export class Engine {
    readonly app: Application

    public globalScope: Record<string, any> = {}
    public scope: Record<string, any> = {}
    public currentScene?: Scene
    public saveFile: SaveFile = new SaveFile()

    public fileLoader: FileLoader = new GithubFileLoader('reksioiufo')
    public music: Sound | null = null
    public canvasBackground: Sprite

    constructor(app: Application) {
        this.app = app

        this.canvasBackground = createColorSprite(this.app, 0x000000)
        this.canvasBackground.zIndex = -99999
    }

    async init() {
        const applicationDef = await this.fileLoader.getCNVFile('DANE/Application.def')
        await loadDefinition(this, this.globalScope, applicationDef)

        this.app.ticker.maxFPS = 16
        this.app.stage.interactive = true
        this.app.stage.sortableChildren = true
        sound.disableAutoPause = true

        this.app.stage.addChild(this.canvasBackground)
        this.app.ticker.add(delta => {
            this.tick(delta)
        })

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

    removeFromStage(sprite: Sprite) {
        this.app.stage.removeChild(sprite)
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
        await loadDefinition(this, this.scope, sceneDefinition, this.currentScene)

        if (this.currentScene.definition.MUSIC) {
            this.music = await loadSound(this.fileLoader, this.currentScene.definition.MUSIC, {
                loop: true
            })
            this.music.play()
        }
        if (this.currentScene.definition.BACKGROUND) {
            this.canvasBackground.texture = await loadTexture(
                this.fileLoader,
                this.currentScene.getRelativePath(this.currentScene.definition.BACKGROUND)
            )
        }

        if (this.fileLoader instanceof UrlFileLoader) {
            await preloadAssets(this.fileLoader, this.currentScene)
        }

        this.app.ticker.start()
    }

    getObject(name: string | reference): any {
        if (typeof name == 'string') {
            return this.scope[name] ?? this.globalScope[name]
        } else {
            return this.getObject(name.objectName)
        }
    }
}

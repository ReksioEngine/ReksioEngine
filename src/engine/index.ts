import {callback, reference} from '../fileFormats/common'
import {runScript} from '../interpreter/evaluator'
import {Type} from './types'
import {loadDefinition} from './definitionLoader'
import {Application, Rectangle, Sprite} from 'pixi.js'
import {Scene} from './types/scene'
import {FileLoader, GithubFileLoader, UrlFileLoader} from '../filesLoader'
import {sound, Sound} from '@pixi/sound'
import {Sound as SoundObject} from './types/sound'
import {loadSound, loadTexture} from './assetsLoader'
import {SaveFile} from './saveFile'
import {createColorTexture} from '../utils'
import {preloadAssets} from './optimizations'
import {setupDebugScene, updateCurrentScene} from './debugging'
import {Timer} from './types/timer'
import {IrrecoverableError} from '../errors'

export class Engine {
    readonly app: Application
    public debug: boolean = false

    public globalScope: Record<string, any> = {}
    public scope: Record<string, any> = {}
    public currentScene?: Scene
    public saveFile: SaveFile = new SaveFile()

    public fileLoader: FileLoader = new GithubFileLoader('reksioiufo')
    public music: Sound | null = null
    public canvasBackground: Sprite

    private readonly blackTexture

    constructor(app: Application) {
        this.app = app
        this.debug = process.env.debug as unknown as boolean

        this.blackTexture = createColorTexture(this.app, new Rectangle(0, 0, this.app.view.width, this.app.view.height), 0)
        this.canvasBackground = new Sprite(this.blackTexture)
        this.canvasBackground.zIndex = -99999
    }

    async init() {
        try {
            const applicationDef = await this.fileLoader.getCNVFile('DANE/Application.def')
            await loadDefinition(this, this.globalScope, applicationDef)
            setupDebugScene(this)

            this.app.ticker.maxFPS = 16
            this.app.stage.interactive = true
            this.app.stage.sortableChildren = true
            sound.disableAutoPause = true

            this.app.stage.addChild(this.canvasBackground)
            this.app.ticker.add(delta => {
                try {
                    this.tick(delta)
                } catch (err) {
                    if (err instanceof IrrecoverableError) {
                        console.error(
                            'Irrecoverable error occurred. Execution paused\nCall "engine.resume()" to resume\n\n%cScope:%c%O',
                            'font-weight: bold', 'font-weight: inherit', this.scope
                        )
                        this.pause()
                    } else {
                        console.error(
                            'Unhandled error occurred during tick. Execution paused\nCall "engine.resume()" to resume\n\n%cScope:%c%O',
                            'font-weight: bold', 'font-weight: inherit', this.scope
                        )
                        console.error(err)
                        this.pause()
                    }
                }
            })

            // @ts-ignore
            globalThis.engine = this
            // @ts-ignore
            globalThis.__PIXI_APP__ = this.app
        } catch (err) {
            console.error(
                'Unhandled error occurred during initialization\n%cScope:%c%O',
                'font-weight: bold', 'font-weight: inherit', this.scope
            )
            console.error(err)
        }
    }

    tick(delta: number) {
        for (const object of Object.values(this.scope)) {
            object.tick(delta)
        }
    }

    executeCallback(caller: Type<any> | null, callback: callback, args?: any[]) {
        if (caller !== null) {
            this.scope.THIS = caller
        }

        if (callback.code) {
            return runScript(this, callback.code, args, callback.isSingleStatement)
        } else if (callback.behaviourReference) {
            if (!this.scope[callback.behaviourReference]) {
                console.error(
                    `Trying to execute behaviour "${callback.behaviourReference}" that doesn't exist!\n\n%cCallback:%c%O\n%cCaller:%c%O`,
                    'font-weight: bold', 'font-weight: inherit', callback,
                    'font-weight: bold', 'font-weight: inherit', caller
                )
                throw new IrrecoverableError()
            }
            return this.scope[callback.behaviourReference].RUN(...callback.constantArguments)
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

        // Remove non-global objects from scope
        // but keep for later destroying
        // to prevent screen flickering
        const objectsToRemove = []
        for (const [key, object] of Object.entries(this.scope)) {
            objectsToRemove.push(object)
            delete this.scope[key]
        }

        this.currentScene = this.getObject(sceneName) as Scene
        const sceneDefinition = await this.fileLoader.getCNVFile(this.currentScene.getRelativePath(`${sceneName}.cnv`))
        await loadDefinition(this, this.scope, sceneDefinition, this.currentScene)

        for (const object of objectsToRemove) {
            object.destroy()
        }

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
        } else {
            this.canvasBackground.texture = this.blackTexture
        }

        if (this.fileLoader instanceof UrlFileLoader) {
            await preloadAssets(this.fileLoader, this.currentScene)
        }

        this.app.ticker.start()
        updateCurrentScene(this)
    }

    getObject(name: string | reference): any {
        if (typeof name == 'string') {
            return this.scope[name] ?? this.globalScope[name]
        } else {
            return this.getObject(name.objectName)
        }
    }

    cloneObject(object: Type<any>) {
        const clone = object.clone()
        object.clones.push(clone)

        clone.name = `${object.definition.NAME}_${object.clones.length}`
        this.scope[clone.name] = clone
        return clone
    }

    resume() {
        if (this.music !== null) {
            this.music.resume()
        }
        for (const object of Object.values(this.scope)) {
            if (object instanceof SoundObject) {
                object.RESUME()
            } else if (object instanceof Timer) {
                object.ENABLE()
            }
        }
        this.app.ticker.start()
    }

    pause() {
        this.app.ticker.stop()
        if (this.music !== null) {
            this.music.pause()
        }
        for (const object of Object.values(this.scope)) {
            if (object instanceof SoundObject) {
                object.PAUSE()
            } else if (object instanceof Timer) {
                object.DISABLE()
            }
        }
    }
}

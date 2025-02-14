import { reference } from '../fileFormats/common'
import { ScriptingManager } from './scripting'
import { loadDefinition } from '../loaders/definitionLoader'
import { Application } from 'pixi.js'
import { Scene } from './types/scene'
import { FileLoader, GithubFileLoader, UrlFileLoader } from '../loaders/filesLoader'
import { sound, Sound } from '@pixi/sound'
import { loadSound, loadTexture } from '../loaders/assetsLoader'
import { SaveFile, SaveFileManager } from './saveFile'
import { preloadAssets } from './optimizations'
import { Debugging } from './debugging'
import { IrrecoverableError } from '../common/errors'
import { initDevtools } from '@pixi/devtools'
import { RenderingManager } from './rendering'

export class Engine {
    public readonly app: Application
    public parentElement: HTMLElement

    public debug: Debugging
    public speed: number = 1

    public globalScope: Record<string, any> = {}
    public scope: Record<string, any> = {}

    public rendering: RenderingManager
    public scripting: ScriptingManager

    public currentScene?: Scene
    public saveFile: SaveFile = SaveFileManager.empty(false)

    public fileLoader: FileLoader = new GithubFileLoader('reksioiufo')
    public music: Sound | null = null

    constructor(parent: HTMLElement, app: Application) {
        this.parentElement = parent
        this.app = app
        this.rendering = new RenderingManager(app)
        this.scripting = new ScriptingManager(this)
        this.debug = new Debugging(this, process.env.debug as unknown as boolean)
    }

    async init() {
        try {
            this.debug.applyQueryParams()

            // @ts-expect-error no engine in globalThis
            globalThis.engine = this
            await initDevtools({ app: this.app })

            if (SaveFileManager.areSavesEnabled()) {
                this.saveFile = SaveFileManager.fromLocalStorage()
            }

            this.rendering.init()
            sound.disableAutoPause = true

            this.app.ticker.add(() => this.tick(this.app.ticker.elapsedMS))
            this.app.ticker.stop()

            this.debug.setupDebugTools()
            if (this.debug.autoStart) {
                await this.start()
            }
        } catch (err) {
            console.error('Unhandled error occurred during initialization')
            console.error(err)
        }
    }

    async start() {
        try {
            await this.fileLoader.init()

            const applicationDef = await this.fileLoader.getCNVFile('DANE/Application.def')
            await loadDefinition(this, this.globalScope, applicationDef, null)

            this.debug.fillSceneSelector()
            this.app.ticker.start()
        } catch (err) {
            console.error(
                'Unhandled error occurred during start\n%cScope:%c%O',
                'font-weight: bold',
                'font-weight: inherit',
                this.scope
            )
            console.error(err)
        }
    }

    tick(elapsedMS: number) {
        for (const object of Object.values(this.scope).filter((object) => object.isReady)) {
            try {
                object.tick(elapsedMS)
            } catch (err) {
                if (err instanceof IrrecoverableError) {
                    console.error(
                        'Irrecoverable error occurred. Execution paused\n' +
                            'Call "engine.resume()" to resume\n' +
                            '\n' +
                            '%cScope:%c%O',
                        'font-weight: bold',
                        'font-weight: inherit',
                        this.scope
                    )
                } else {
                    console.error(
                        'Unhandled error occurred during tick. Execution paused\n' +
                            'Call "engine.resume()" to resume\n' +
                            '\n' +
                            '%cScope:%c%O',
                        'font-weight: bold',
                        'font-weight: inherit',
                        this.scope
                    )
                    console.error(err)
                }
                this.pause()
            }
        }

        this.debug.updateXRay()
    }

    async changeScene(sceneName: string) {
        this.app.ticker.stop()
        sound.stopAll()
        if (this.music !== null) {
            this.music.stop()
        }

        this.rendering.onSceneChange()

        // Remove non-global objects from scope
        // but keep for later destroying
        // to prevent screen flickering
        const objectsToRemove = []
        for (const [key, object] of Object.entries(this.scope)) {
            objectsToRemove.push(object)
            delete this.scope[key]
        }

        // Load new scene
        if (this.debug.nextSceneOverwrite) {
            sceneName = this.debug.nextSceneOverwrite
            this.debug.nextSceneOverwrite = null
        }

        this.currentScene = this.getObject(sceneName) as Scene

        // Set background image
        if (this.currentScene.definition.BACKGROUND) {
            this.rendering.setBackground(
                await loadTexture(
                    this.fileLoader,
                    this.currentScene.getRelativePath(this.currentScene.definition.BACKGROUND)
                )
            )
        } else {
            this.rendering.clearBackground()
        }

        const sceneDefinition = await this.fileLoader.getCNVFile(this.currentScene.getRelativePath(sceneName + '.cnv'))
        await loadDefinition(this, this.scope, sceneDefinition, this.currentScene)

        for (const object of objectsToRemove) {
            object.destroy()
        }

        // Play new scene background music
        if (this.currentScene.definition.MUSIC) {
            this.music = await loadSound(this.fileLoader, this.currentScene.definition.MUSIC, {
                loop: true,
            })
            this.music.play()
            if (this.debug.mutedMusic) {
                this.music.muted = true
            }
        }

        // Wait for assets to load
        if (this.fileLoader instanceof UrlFileLoader) {
            await preloadAssets(this.fileLoader, this.currentScene)
        }

        this.app.ticker.start()
        this.debug.updateCurrentScene()
    }

    getObject(name: string | reference): any {
        if (typeof name == 'string') {
            if (name === 'THIS') {
                return this.scripting.currentThis
            }

            return this.scope[name] ?? this.globalScope[name] ?? null
        } else {
            return this.getObject(name.objectName)
        }
    }

    resume() {
        sound.resumeAll()
        for (const object of Object.values(this.scope)) {
            object.resume()
        }
        this.app.ticker.start()
    }

    pause() {
        this.app.ticker.stop()
        sound.pauseAll()
        for (const object of Object.values(this.scope)) {
            object.pause()
        }
    }
}

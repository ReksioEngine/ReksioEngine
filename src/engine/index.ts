import { reference } from '../fileFormats/common'
import { ScriptingManager } from './scripting'
import { loadDefinition } from '../loaders/definitionLoader'
import { Application } from 'pixi.js'
import { Scene } from './types/scene'
import { FileLoader } from '../loaders/filesLoader'
import { sound, Sound } from '@pixi/sound'
import { loadSound, loadTexture } from '../loaders/assetsLoader'
import { SaveFile, SaveFileManager } from './saveFile'
import { Debugging } from './debugging'
import { assert, IgnorableError, IrrecoverableError } from '../common/errors'
import { initDevtools } from '@pixi/devtools'
import { RenderingManager } from './rendering'
import { GamePlayerOptions } from '../index'
import { Scope, ScopeManager } from './scope'
import { Episode } from './types/episode'

export class Engine {
    public debug: Debugging
    public speed: number = 1

    public scopeManager: ScopeManager

    public rendering: RenderingManager
    public scripting: ScriptingManager

    public currentScene: Scene | null = null
    public previousScene: Scene | null = null

    public saveFile: SaveFile = SaveFileManager.empty(false)

    public fileLoader: FileLoader
    public music: Sound | null = null

    constructor(
        public readonly app: Application,
        public readonly options: GamePlayerOptions
    ) {
        this.rendering = new RenderingManager(app)
        this.scripting = new ScriptingManager(this)
        this.scopeManager = new ScopeManager()
        this.debug = new Debugging(this, this.options.debug ?? false, options.debugContainer)
        this.fileLoader = this.options.fileLoader
    }

    async init() {
        try {
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
            await this.start()
        } catch (err) {
            console.error('Unhandled error occurred during initialization')
            console.error(err)
        }
    }

    async start() {
        try {
            await this.fileLoader.init()

            const applicationDef = await this.fileLoader.getCNVFile('DANE/Application.def')
            await loadDefinition(this, this.scopeManager.newScope('root'), applicationDef, null)

            const episode: Episode | null = this.scopeManager.findByType('EPISODE')
            if (episode === null) {
                throw new IrrecoverableError("Starting episode doesn't exist")
            }

            this.debug.fillSceneSelector()
            await this.changeScene(this.options.startScene ?? episode.definition.STARTWITH)

            this.app.ticker.start()
        } catch (err) {
            console.error(
                'Unhandled error occurred during start\n%cScope:%c%O',
                'font-weight: bold',
                'font-weight: inherit',
                this.scopeManager.scopes
            )
            console.error(err)
        }
    }

    tick(elapsedMS: number) {
        const sceneScope = this.scopeManager.getScope('scene')
        if (sceneScope === null) {
            return
        }

        for (const object of sceneScope.objects.filter((object) => object.isReady)) {
            try {
                object.tick(elapsedMS)
            } catch (err) {
                if (err instanceof CancelTick) {
                    if (err.callback) {
                        err.callback()
                    }
                    return
                } else if (err instanceof IrrecoverableError) {
                    console.error(
                        'Irrecoverable error occurred. Execution paused\n' +
                            'Call "engine.resume()" to resume\n' +
                            '\n' +
                            '%cScope:%c%O',
                        'font-weight: bold',
                        'font-weight: inherit',
                        this.scopeManager.scopes
                    )
                } else {
                    console.error(
                        'Unhandled error occurred during tick. Execution paused\n' +
                            'Call "engine.resume()" to resume\n' +
                            '\n' +
                            '%cScope:%c%O',
                        'font-weight: bold',
                        'font-weight: inherit',
                        this.scopeManager.scopes
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
        const scopeToClear: Scope | null = this.currentScene !== null ? (this.scopeManager.popScope() ?? null) : null
        if (scopeToClear) {
            for (const object of scopeToClear.objects) {
                objectsToRemove.push(object)
                this.scopeManager.getScope('scene')?.remove(object.name)
            }
        }

        this.previousScene = this.currentScene
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
        await loadDefinition(this, this.scopeManager.newScope('scene'), sceneDefinition, this.currentScene)

        for (const object of objectsToRemove) {
            object.destroy()
        }

        // Play new scene background music
        if (this.currentScene.definition.MUSIC) {
            this.music = await loadSound(this.fileLoader, this.currentScene.definition.MUSIC, {
                loop: true,
            })
            const instance = this.music.play()
            assert(!(instance instanceof Promise), 'Sound should already be preloaded')
            if (this.debug.mutedMusic) {
                this.music.muted = true
            }
        }

        this.app.ticker.start()
        this.debug.updateCurrentScene()
    }

    getObject(name: string | reference): any {
        if (typeof name == 'string') {
            return this.scopeManager.findByName(name)
        } else {
            return this.getObject(name.objectName)
        }
    }

    resume() {
        const sceneScope = this.scopeManager.getScope('scene')
        assert(sceneScope != null)

        sound.resumeAll()
        for (const object of sceneScope.objects) {
            object.resume()
        }
        this.app.ticker.start()
    }

    pause() {
        const sceneScope = this.scopeManager.getScope('scene')
        assert(sceneScope != null)

        this.app.ticker.stop()
        sound.pauseAll()
        for (const object of sceneScope.objects) {
            object.pause()
        }
    }
}

export class CancelTick extends IgnorableError {
    constructor(public callback?: () => void) {
        super()
    }
}

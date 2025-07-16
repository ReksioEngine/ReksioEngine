import { reference } from '../fileFormats/common'
import { ScriptingManager } from './scripting'
import { loadDefinition, doReady } from '../filesystem/definitionLoader'
import { Application, Rectangle, Sprite, Texture } from 'pixi.js'
import { Scene } from './types/scene'
import { loadSound, loadTexture } from '../filesystem/assetsLoader'
import { SaveFile, SaveFileManager } from './saveFile'
import { Debugging } from './debugging'
import { assert, IgnorableError, IrrecoverableError } from '../common/errors'
import { initDevtools } from '@pixi/devtools'
import { RenderingManager } from './rendering'
import { BUILD_VARS, GamePlayerOptions } from '../index'
import { Scope, ScopeManager } from './scope'
import { Episode } from './types/episode'
import { ISound, soundLibrary } from './sounds'
import { Type } from './types'
import Filesystem, { pathJoin } from '../filesystem'

export class Engine {
    public debug: Debugging
    public speed: number = 1

    public scopeManager: ScopeManager

    public rendering: RenderingManager
    public scripting: ScriptingManager

    public currentScene: Scene | null = null
    public previousScene: Scene | null = null

    public saveFile: SaveFile

    public filesystem: Filesystem
    public music: ISound | null = null

    constructor(
        public readonly app: Application,
        public readonly options: GamePlayerOptions
    ) {
        this.rendering = new RenderingManager(app)
        this.scripting = new ScriptingManager(this)
        this.scopeManager = new ScopeManager()
        this.debug = new Debugging(this, this.options.debug ?? false, options.debugContainer ?? null)
        this.filesystem = new Filesystem(this.options.fileLoader, this.options.storage)
        this.saveFile = this.options.saveFile ?? SaveFileManager.empty(undefined)
    }

    async init() {
        try {
            // @ts-expect-error no engine in globalThis
            globalThis.engine = this
            await initDevtools({ app: this.app })

            this.rendering.init()
            soundLibrary.disableAutoPause = true

            if (!BUILD_VARS.manualTick) {
                this.app.ticker.add(() => this.tick(this.app.ticker.elapsedMS))
            }
            this.app.ticker.stop()

            this.debug.setupDebugTools()
        } catch (err) {
            console.error('Unhandled error occurred during initialization')
            console.error(err)
        }
    }

    async start() {
        try {
            await this.filesystem.init()

            const applicationDef = await this.filesystem.getCNVFile('DANE/Application.def')
            const rootScope = this.scopeManager.newScope('root')
            await loadDefinition(this, rootScope, applicationDef, null)
            await doReady(rootScope)

            const episode: Episode | null = this.scopeManager.findByType('EPISODE')
            if (episode === null) {
                throw new IrrecoverableError("Starting episode doesn't exist")
            }

            await this.debug.fillSceneSelector()
            await this.changeScene(this.options.startScene ?? episode.definition.STARTWITH)

            this.app.ticker.start()
        } catch (err) {
            if (err instanceof CancelTick) {
                if (err.callback) {
                    await err.callback()
                }
                return
            }
            console.error(
                'Unhandled error occurred during start\n%cGlobal scopes:%c%O',
                'font-weight: bold',
                'font-weight: inherit',
                this.scopeManager.scopes
            )
            console.error(err)
        }
    }

    destroy() {
        this.app.destroy()
        if (this.music !== null) {
            this.music.stop()
        }
        soundLibrary.stopAll()
    }

    async tick(elapsedMS: number) {
        for (const scope of this.scopeManager.scopes) {
            for (const object of scope.objects.filter((object) => object.isReady)) {
                try {
                    await object.tick(elapsedMS)
                } catch (err) {
                    if (err instanceof CancelTick) {
                        if (err.callback) {
                            await err.callback()
                        }
                        return
                    } else if (err instanceof IrrecoverableError) {
                        console.error(
                            'Irrecoverable error occurred. Execution paused\n' +
                            'Call "engine.resume()" to resume\n' +
                            '\n' +
                            '%cGlobal scopes:%c%O',
                            'font-weight: bold',
                            'font-weight: inherit',
                            this.scopeManager.scopes
                        )
                    } else {
                        console.error(
                            'Unhandled error occurred during tick. Execution paused\n' +
                            'Call "engine.resume()" to resume\n' +
                            '\n' +
                            '%cGlobal scopes:%c%O',
                            'font-weight: bold',
                            'font-weight: inherit',
                            this.scopeManager.scopes
                        )
                        console.error(err)
                    }
                    this.pause()
                }
            }
        }

        this.debug.updateXRay()
    }

    async changeScene(sceneName: string) {
        if (this.options.onSceneChange) {
            this.options.onSceneChange(sceneName, this.currentScene?.name)
        }

        this.app.ticker.stop()
        soundLibrary.stopAll([this.music])

        this.rendering.onSceneChange()

        this.app.stage.addChild(this.rendering.loadingDarkOverlay)
        this.app.stage.addChild(this.rendering.loadingText)
        this.app.renderer.render(this.app.stage)

        const loadingFreezeOverlay = Sprite.from(
            await this.app.renderer.extract.image(
                this.app.stage,
                undefined,
                undefined,
                new Rectangle(0, 0, this.app.view.width, this.app.view.height)
            )
        )
        loadingFreezeOverlay.name = 'Loading freeze overlay'
        loadingFreezeOverlay.zIndex = 9999999
        this.app.stage.addChild(loadingFreezeOverlay)
        this.app.renderer.render(this.app.stage)

        const scopeToClear: Scope | null = this.currentScene !== null ? this.currentScene.scope : null
        if (scopeToClear) {
            this.scopeManager.removeScope(scopeToClear)
            for (const object of scopeToClear.objects) {
                object.destroy()
                scopeToClear.remove(object.name)
            }
        }

        // Alert when rendering stage wasn't completely cleared after all destroys.
        // For debugging purposes.
        const leakedObjects = this.app.stage.children.filter(
            (obj) =>
                ![
                    loadingFreezeOverlay,
                    this.rendering.loadingDarkOverlay,
                    this.rendering.loadingText,
                    this.rendering.canvasBackground,
                ].includes(obj as any)
        )
        if (leakedObjects.length > 0) {
            console.error('Display objects leak detected', leakedObjects)
        }

        this.previousScene = this.currentScene
        this.currentScene = this.getObject(sceneName) as Scene
        assert(this.currentScene !== null, 'could not find scene')

        if (this.music !== null && this.currentScene.definition.MUSIC !== this.previousScene?.definition.MUSIC) {
            this.music.stop()
            this.music = null
        }

        // Set background image
        let texturePromise: Promise<Texture> | null = null
        if (this.currentScene.definition.BACKGROUND) {
            texturePromise = loadTexture(
                this.filesystem,
                await this.currentScene.getRelativePath(this.currentScene.definition.BACKGROUND)
            )
        } else {
            this.rendering.clearBackground()
        }

        // Play new scene background music.
        // We keep playing the same music if it was the same in previous scene
        let musicPromise = null
        if (this.music == null && this.currentScene.definition.MUSIC) {
            musicPromise = loadSound(this.filesystem, this.currentScene.definition.MUSIC, {
                loop: true,
            })
        }

        const sceneDefinitionPromise = this.filesystem.getCNVFile(
            await this.currentScene!.getRelativePath(sceneName + '.cnv')
        )
        const newScopePromise: Promise<Scope> = new Promise((resolve, reject) => {
            sceneDefinitionPromise
                .then((sceneDefinition) => {
                    const newScope = this.scopeManager.newScope('scene')
                    assert(this.currentScene !== null, 'could not find scene')
                    this.currentScene.scope = newScope
                    const newScopePromise = loadDefinition(this, newScope, sceneDefinition, this.currentScene)
                    newScopePromise
                        .then(() => {
                            resolve(newScope)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })

        const [texture, music, newScope] = await Promise.all([texturePromise, musicPromise, newScopePromise])
        if (texture) {
            this.rendering.setBackground(texture)
        }
        if (music) {
            this.music = music
            await this.music.play()
            if (this.debug.mutedMusic) {
                this.music.muted = true
            }
        }
        if (newScope) {
            await doReady(newScope)
        }

        this.app.stage.removeChild(loadingFreezeOverlay)
        this.app.stage.removeChild(this.rendering.loadingDarkOverlay)
        this.app.stage.removeChild(this.rendering.loadingText)

        this.app.ticker.start()
        this.debug.updateCurrentScene()
    }

    getObject<T extends Type<any>>(name: string | reference | null, parentScope: Scope | null = null): T | null {
        if (typeof name == 'string') {
            const currentScopeEntry = parentScope?.get<T>(name)
            if (currentScopeEntry) {
                return currentScopeEntry
            }

            return this.scopeManager.findByName(name, parentScope)
        } else if (name === null) {
            return null
        } else {
            return this.getObject(name.objectName, parentScope)
        }
    }

    async resolvePath(path: string, base = '') {
        if (path.startsWith('$')) {
            base = ''
            path = path.substring(1)
        }

        const lang = this.scopeManager.APPLICATION.GETLANGUAGE()
        const langPath = pathJoin(base, lang, path)
        const noLangPath = pathJoin(base, path)

        if (await this.filesystem.hasFile(langPath)) {
            return langPath
        } else {
            return noLangPath
        }
    }

    resume() {
        const sceneScope = this.currentScene?.scope
        assert(sceneScope)

        soundLibrary.resumeAll()
        for (const object of sceneScope.objects) {
            object.resume()
        }
        this.app.ticker.start()
    }

    pause() {
        const sceneScope = this.currentScene?.scope
        assert(sceneScope)

        this.app.ticker.stop()
        soundLibrary.pauseAll()
        for (const object of sceneScope.objects) {
            object.pause()
        }
    }
}

export class CancelTick extends IgnorableError {
    constructor(public callback?: () => Promise<void>) {
        super()
    }
}

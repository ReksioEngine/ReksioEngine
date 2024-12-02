import { callback, reference } from '../fileFormats/common'
import { runScript } from '../interpreter/evaluator'
import { DisplayType, Type } from './types'
import { loadDefinition } from './definitionLoader'
import { Application, Rectangle, Sprite } from 'pixi.js'
import { Scene } from './types/scene'
import { FileLoader, GithubFileLoader, UrlFileLoader } from './filesLoader'
import { sound, Sound } from '@pixi/sound'
import { loadSound, loadTexture } from './assetsLoader'
import { SaveFile } from './saveFile'
import { createColorTexture } from '../utils'
import { preloadAssets } from './optimizations'
import { Debugging } from './debugging'
import { Timer } from './types/timer'
import { IrrecoverableError } from '../errors'
import { StackFrame, stackTrace } from '../interpreter/stacktrace'

export class Engine {
    readonly app: Application
    public debug: Debugging
    public speed: number = 1

    private thisQueue: Type<any>[] = []
    public globalScope: Record<string, any> = {}
    public scope: Record<string, any> = {}
    public displayObjectsInDefinitionOrder: DisplayType<any>[] = []

    public currentScene?: Scene
    public saveFile: SaveFile = new SaveFile()

    public fileLoader: FileLoader = new GithubFileLoader('reksioiufo')
    public music: Sound | null = null
    public canvasBackground: Sprite

    private readonly blackTexture

    constructor(app: Application) {
        this.app = app
        this.debug = new Debugging(this, process.env.debug as unknown as boolean)

        this.blackTexture = createColorTexture(
            this.app,
            new Rectangle(0, 0, this.app.view.width, this.app.view.height),
            0
        )
        this.canvasBackground = new Sprite(this.blackTexture)
        this.canvasBackground.zIndex = -99999
    }

    async init() {
        try {
            this.debug.applyQueryParams()

            const applicationDef = await this.fileLoader.getCNVFile('DANE/Application.def')
            await loadDefinition(this, this.globalScope, applicationDef)

            this.debug.setupSceneSelector()

            this.app.ticker.maxFPS = 60
            this.app.stage.interactive = true
            sound.disableAutoPause = true

            this.app.stage.addChild(this.canvasBackground)
            this.app.ticker.add(() => this.tick(this.app.ticker.elapsedMS))

            // @ts-expect-error no engine in globalThis
            globalThis.engine = this
            // @ts-expect-error no __PIXI_APP__ in globalThis
            globalThis.__PIXI_APP__ = this.app
        } catch (err) {
            console.error(
                'Unhandled error occurred during initialization\n%cScope:%c%O',
                'font-weight: bold',
                'font-weight: inherit',
                this.scope
            )
            console.error(err)
        }
    }

    tick(elapsedMS: number) {
        for (const object of Object.values(this.scope)) {
            try {
                object.tick(elapsedMS)
            } catch (err) {
                if (err instanceof IrrecoverableError) {
                    console.error(
                        'Irrecoverable error occurred. Execution paused\nCall "engine.resume()" to resume\n\n%cScope:%c%O',
                        'font-weight: bold',
                        'font-weight: inherit',
                        this.scope
                    )
                } else {
                    console.error(
                        'Unhandled error occurred during tick. Execution paused\nCall "engine.resume()" to resume\n\n%cScope:%c%O',
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

    executeCallback(caller: Type<any> | null, callback: callback, args?: any[]) {
        if (caller !== null) {
            this.thisQueue.push(caller)
        }

        let stackFrame = null

        try {
            if (callback.code) {
                return runScript(this, callback.code, args, callback.isSingleStatement)
            } else if (callback.behaviourReference) {
                if (!this.scope[callback.behaviourReference]) {
                    console.error(
                        `Trying to execute behaviour "${callback.behaviourReference}" that doesn't exist!\n\n%cCallback:%c%O\n%cCaller:%c%O`,
                        'font-weight: bold',
                        'font-weight: inherit',
                        callback,
                        'font-weight: bold',
                        'font-weight: inherit',
                        caller
                    )
                    return
                }

                stackFrame = StackFrame.builder()
                    .type('behaviour')
                    .behaviour(callback.behaviourReference)
                    .args(...(args !== undefined ? args : []))
                    .build()

                stackTrace.push(stackFrame)
                return this.scope[callback.behaviourReference].RUNC(...callback.constantArguments)
            }
        } finally {
            if (caller !== null) {
                this.thisQueue.pop()
            }

            if (stackFrame !== null) {
                stackTrace.pop()
            }
        }
    }

    runScript(code: string, args: any[], isSingleStatement: boolean, printDebug: boolean) {
        return runScript(this, code, args, isSingleStatement, printDebug)
    }

    addToStage(sprite: Sprite) {
        this.app.stage.addChild(sprite)
        this.sortObjects()
    }

    removeFromStage(sprite: Sprite) {
        this.app.stage.removeChild(sprite)
        this.sortObjects()
    }

    sortObjects() {
        // Sort by zIndex + the order of creation if zIndex is the same.
        // Default PIXI.js sorting have problem with equal zIndex case.
        this.app.stage.children.sort((a, b) => {
            if (a.zIndex !== b.zIndex) {
                return a.zIndex - b.zIndex
            }

            const objectA = this.displayObjectsInDefinitionOrder.find((e) => e.getRenderObject() === a)
            const objectB = this.displayObjectsInDefinitionOrder.find((e) => e.getRenderObject() === b)

            if (objectA === undefined || objectB === undefined) {
                return 0
            }

            const renderingOrderA = this.displayObjectsInDefinitionOrder.indexOf(objectA)
            const renderingOrderB = this.displayObjectsInDefinitionOrder.indexOf(objectB)

            const orderA = a.zIndex + renderingOrderA
            const orderB = b.zIndex + renderingOrderB

            return orderA - orderB
        })
    }

    async changeScene(sceneName: string) {
        this.app.ticker.stop()
        sound.stopAll()
        if (this.music !== null) {
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
        this.displayObjectsInDefinitionOrder = []

        // Load new scene
        if (this.debug.nextSceneOverwrite) {
            sceneName = this.debug.nextSceneOverwrite
            this.debug.nextSceneOverwrite = null
        }

        this.currentScene = this.getObject(sceneName) as Scene

        // Set background image
        if (this.currentScene.definition.BACKGROUND) {
            this.canvasBackground.texture = await loadTexture(
                this.fileLoader,
                this.currentScene.getRelativePath(this.currentScene.definition.BACKGROUND)
            )
        } else {
            this.canvasBackground.texture = this.blackTexture
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
                return this.thisQueue[this.thisQueue.length - 1]
            }

            return this.scope[name] ?? this.globalScope[name] ?? null
        } else {
            return this.getObject(name.objectName)
        }
    }

    resume() {
        sound.resumeAll()
        for (const object of Object.values(this.scope)) {
            if (object instanceof Timer) {
                object.ENABLE()
            }
        }
        this.app.ticker.start()
    }

    pause() {
        this.app.ticker.stop()
        sound.pauseAll()
        for (const object of Object.values(this.scope)) {
            if (object instanceof Timer) {
                object.DISABLE()
            }
        }
    }
}

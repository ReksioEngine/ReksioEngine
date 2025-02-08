import { Episode } from './types/episode'
import { Type } from './types'
import { Engine } from './index'
import { sound } from '@pixi/sound'
import { ArchiveOrgFileLoader, GithubFileLoader, IsoFileLoader } from '../loaders/filesLoader'
import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import { Animo } from './types/animo'
import { CNVObject, parseCNV } from '../fileFormats/cnv/parser'
import { createObject, loadDefinition } from '../loaders/definitionLoader'
import { SaveFileManager } from './saveFile'
import { printStackTrace } from '../interpreter/script/stacktrace'
import { EngineError } from '../common/errors'
import { drawRectangle } from './rendering'
import debuggingTemplate from './debugging.html'

export class Debugging {
    private readonly engine: Engine
    public enabled = false
    public autoStart = true

    public nextSceneOverwrite: string | null = null
    public mutedMusic = false

    private xrays: Map<string, Container> = new Map()
    private enableXRay = false
    private enableXRayInvisible = false

    constructor(engine: Engine, isDebug: boolean) {
        this.engine = engine
        this.enabled = isDebug
    }

    async createObject(definition: CNVObject) {
        return await createObject(this.engine, definition, null)
    }

    async loadCNV(definition: string, scope: Record<string, any> = this.engine.scope) {
        await loadDefinition(this.engine, scope, parseCNV(definition), null)
        return scope
    }

    clearScope() {
        this.engine.app.ticker.stop()

        sound.stopAll()
        if (this.engine.music !== null) {
            this.engine.music.stop()
        }

        for (const [key, object] of Object.entries(this.engine.scope)) {
            object.destroy()
            delete this.engine.scope[key]
        }

        this.engine.app.ticker.start()
    }

    applyQueryParams() {
        if (!this.enabled) {
            return
        }

        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has('loader') && urlParams.has('source')) {
            const loader = urlParams.get('loader')!
            const source = urlParams.get('source')!

            if (loader === 'github') {
                this.engine.fileLoader = new GithubFileLoader(source)
            } else if (loader === 'archiveorg') {
                this.engine.fileLoader = new ArchiveOrgFileLoader(source)
            }
        }
        if (urlParams.has('autostart')) {
            this.autoStart = urlParams.get('autostart') === 'true'
        }

        this.nextSceneOverwrite = urlParams.get('scene')
    }

    setupDebugTools() {
        if (!this.enabled) {
            return
        }

        const debugTools = document.createElement('div')
        debugTools.innerHTML = debuggingTemplate
        debugTools.style.display = 'inline-block'
        this.engine.parent.appendChild(debugTools)

        const speedSlider: HTMLInputElement = debugTools.querySelector('#speed')!
        const speedReset = debugTools.querySelector('#speedReset')!
        const speedDisplay = debugTools.querySelector('#speedDisplay')!
        const spaceVelocity: HTMLInputElement = debugTools.querySelector('#spaceVelocity')!
        const xray: HTMLInputElement = debugTools.querySelector('#xray')!
        const xrayInvisible: HTMLInputElement = debugTools.querySelector('#xrayShowInvisible')!

        const sceneSelector: HTMLSelectElement = debugTools.querySelector('#sceneSelector')!
        const sceneRestart = debugTools.querySelector('#restartButton')!
        const resetSave = debugTools.querySelector('#resetSave')!
        const resetSaveAndRestart = debugTools.querySelector('#resetSaveAndRestart')!
        const importSave = debugTools.querySelector('#importSave')!
        const exportSave = debugTools.querySelector('#exportSave')!
        const enableSaveFiles: HTMLInputElement = debugTools.querySelector('#enableSaveFiles')!
        const muteMusic: HTMLInputElement = debugTools.querySelector('#muteMusic')!
        const isoInput = debugTools.querySelector('#isoInput')!

        isoInput.addEventListener('change', async (event: any) => {
            const fileLoader = new IsoFileLoader(event.target.files[0])
            await fileLoader.init()
            this.engine.fileLoader = fileLoader
            await this.engine.start()
        })

        const setSpeed = (speed: number) => {
            this.engine.speed = speed
            sound.speedAll = speed
            speedDisplay.textContent = `(${speed}x)`

            this.engine.app.ticker.maxFPS = speed > 1 ? 0 : 60
        }

        speedSlider.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement

            let sliderValue = target.value as unknown as number
            if (sliderValue > 1) {
                sliderValue = Math.round(1 + (sliderValue - 1) * 10)
            }

            setSpeed(sliderValue)
        })

        speedReset.addEventListener('click', () => {
            speedSlider.value = String(1)
            setSpeed(1)
        })

        spaceVelocity.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement

            if (target.checked) {
                speedSlider.max = String(9.9)
            } else {
                speedSlider.max = String(1.9)
                speedSlider.value = String(1)
                setSpeed(1)
            }
        })

        muteMusic.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement
            this.mutedMusic = target.checked
            if (this.engine.music !== null) {
                this.engine.music.muted = target.checked
            }
        })

        xray.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement
            this.enableXRay = target.checked
        })
        xrayInvisible.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement
            this.enableXRayInvisible = target.checked
        })

        sceneSelector.addEventListener('change', async () => {
            try {
                await this.engine.changeScene(sceneSelector.value)
            } catch (err) {
                console.error(err)
                if (err instanceof EngineError) {
                    printStackTrace(err.stackTrace)
                }
            }
        })

        sceneRestart.addEventListener('click', async () => {
            try {
                await this.engine.changeScene(this.engine.currentScene!.name)
            } catch (err) {
                console.error(err)
                if (err instanceof EngineError) {
                    printStackTrace(err.stackTrace)
                }
            }
        })

        resetSave.addEventListener('click', () => {
            this.engine.pause()
            this.engine.saveFile.reset()
            this.engine.resume()
        })

        resetSaveAndRestart.addEventListener('click', () => {
            this.engine.pause()
            this.engine.saveFile.reset()
            window.location.reload()
        })

        importSave.addEventListener('click', () => {
            const input = document.createElement('input')
            input.type = 'file'

            input.onchange = (e: any) => {
                const file = e.target.files[0]
                const reader = new FileReader()
                reader.readAsText(file, 'UTF-8')
                reader.onload = (readerEvent) => {
                    const content: any = readerEvent.target?.result

                    this.engine.pause()
                    this.engine.saveFile = SaveFileManager.fromINI(content, true)
                    window.location.reload()
                }
            }

            input.click()
        })

        exportSave.addEventListener('click', () => {
            const data = SaveFileManager.toINI(this.engine.saveFile)
            const blob = new Blob([data], { type: 'text/plain' })
            const fileURL = URL.createObjectURL(blob)
            const downloadLink = document.createElement('a')
            downloadLink.href = fileURL
            downloadLink.download = `${this.engine.currentScene?.name}_${new Date().toISOString()}.ini`
            downloadLink.click()
            URL.revokeObjectURL(fileURL)
        })

        enableSaveFiles.checked = SaveFileManager.areSavesEnabled()
        enableSaveFiles.addEventListener('change', () => {
            localStorage.setItem('savesEnabled', JSON.stringify(enableSaveFiles.checked))

            if (!enableSaveFiles.checked) {
                this.engine.saveFile = SaveFileManager.empty(false)
            } else {
                this.engine.saveFile = SaveFileManager.fromLocalStorage()
            }
        })
    }

    fillSceneSelector() {
        const sceneSelector: any = document.querySelector('#sceneSelector')!

        const episode: Episode = Object.values(this.engine.globalScope).find(
            (object: Type<any>) => object.definition.TYPE === 'EPISODE'
        )
        if (episode === undefined) {
            return
        }

        for (const sceneName of episode.definition.SCENES) {
            const scene = Object.values(this.engine.globalScope).find((object: Type<any>) => {
                return object.definition.TYPE === 'SCENE' && object.definition.NAME === sceneName
            })

            const sceneDefPath = scene.getRelativePath(`${sceneName}.cnv`)
            const canGoTo = this.engine.fileLoader.getFilesListing().includes(sceneDefPath.toLowerCase())

            const option = document.createElement('option')
            option.value = sceneName
            option.text = sceneName
            option.disabled = !canGoTo
            sceneSelector.appendChild(option)
        }
    }

    updateCurrentScene() {
        if (this.enabled) {
            const currentScene = document.querySelector('#sceneSelector')! as HTMLInputElement
            currentScene.value = this.engine.currentScene!.definition.NAME
        }

        for (const [name, container] of this.xrays) {
            container.destroy({
                children: true,
            })
            this.xrays.delete(name)
        }
    }

    updateXRay() {
        if (!this.enableXRay) {
            for (const [name, container] of this.xrays) {
                container.destroy({
                    children: true,
                })
                this.xrays.delete(name)
            }
            return
        }

        for (const object of Object.values(this.engine.scope)) {
            const info = object.__getXRayInfo()
            if (info == null || (!this.enableXRayInvisible && !info.visible)) {
                this.xrays.get(object.name)?.destroy({
                    children: true,
                })
                this.xrays.delete(object.name)
                continue
            }

            if (this.xrays.has(object.name)) {
                const oldRectangle = this.xrays.get(object.name)!
                if (
                    oldRectangle.x === info.bounds.x &&
                    oldRectangle.y === info.bounds.y &&
                    oldRectangle.width === info.bounds.width &&
                    oldRectangle.height === info.bounds.height
                ) {
                    continue
                }
            }

            let container: Container
            let graphics: Graphics
            let nameText: Text
            let eventText: Text | null = null

            if (this.xrays.has(object.name)) {
                container = this.xrays.get(object.name)!
                graphics = container.getChildAt(0) as Graphics
                graphics.clear()

                nameText = container.getChildAt(1) as Text
                nameText.text = object.name

                if (object instanceof Animo) {
                    eventText = container.getChildAt(2) as Text
                    eventText.text = object.GETEVENTNAME()
                }
            } else {
                container = new Container()
                container.__devtoolIgnore = true // For PIXI Devtools
                container.eventMode = 'none'
                this.engine.app.stage.addChild(container)
                this.xrays.set(object.name, container)

                graphics = new Graphics()
                container.addChild(graphics)

                nameText = new Text(object.name)
                container.addChild(nameText)

                if (object instanceof Animo) {
                    eventText = new Text(object.GETEVENTNAME())
                    container.addChild(eventText)
                }
            }

            const drawRect = new Rectangle(info.bounds.x, info.bounds.y, info.bounds.width, info.bounds.height)
            drawRectangle(graphics, drawRect, 0, 0, 1, info.color ?? (info.visible ? 0xff00ff : 0xc0c0c0))

            nameText.style = {
                fontSize: info.position === 'outside' ? 7 : 11,
                fontWeight: 'bold',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 2,
            }
            nameText.x = info.bounds.x + (info.position === 'outside' ? 0 : 5)
            nameText.y = info.bounds.y + (info.position === 'outside' ? -11 : 5)

            if (object instanceof Animo && eventText !== null) {
                eventText.style = {
                    fontSize: 8,
                    fill: '#00ffff',
                    stroke: '#000000',
                    strokeThickness: 2,
                }
                eventText.x = info.position === 'outside' ? info.bounds.x : info.bounds.x + 5
                eventText.y = (info.position === 'outside' ? info.bounds.y - 15 : info.bounds.y) + 5 + 12
            }
        }
    }
}

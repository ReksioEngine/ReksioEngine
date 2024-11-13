import {Episode} from './types/episode'
import {DisplayType, Type} from './types'
import {Engine} from './index'
import {sound} from '@pixi/sound'
import {ArchiveOrgFileLoader, GithubFileLoader} from './filesLoader'
import {drawRectangle} from '../utils'
import {Container, Graphics, Rectangle, Sprite, Text} from 'pixi.js'
import {Animo} from './types/animo'
import {Button} from './types/button'
import {CNVObject, parseCNV} from '../fileFormats/cnv/parser'
import {createObject, loadDefinition} from './definitionLoader'

export class Debugging {
    private engine: Engine
    public isDebug = false

    public nextSceneOverwrite: string | null = null
    private xrays: Map<string, Container> = new Map()
    private enableXRay = false

    constructor(engine: Engine, isDebug: boolean) {
        this.engine = engine
        this.isDebug = isDebug
    }

    async createObject(definition: CNVObject) {
        return await createObject(this.engine, definition)
    }

    async loadCNV(definition: string, scope: Record<string, any> = this.engine.scope) {
        await loadDefinition(this.engine, scope, parseCNV(definition))
        return scope
    }

    applyQueryParams() {
        if (!this.isDebug) {
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

        this.nextSceneOverwrite = urlParams.get('scene')
    }

    setupSceneSelector() {
        if (!this.isDebug) {
            return
        }

        const debug: any = document.querySelector('#debug')!
        debug.style.display = 'block'

        const speedSlider = debug.querySelector('#speed')
        const speedReset = debug.querySelector('#speedReset')
        const speedDisplay = debug.querySelector('#speedDisplay')
        const spaceVelocity = debug.querySelector('#spaceVelocity')
        const xray = debug.querySelector('#xray')

        const sceneSelector: any = document.querySelector('#sceneSelector')!
        const sceneChangeButton = document.querySelector('#changeScene')!

        const setSpeed = (speed: number) => {
            this.engine.speed = speed
            sound.speedAll = speed
            speedDisplay.textContent = `(${speed}x)`

            this.engine.app.ticker.maxFPS = speed > 1 ? 0 : 60
        }

        speedSlider.addEventListener('input', (e: InputEvent) => {
            const target = e.target as HTMLInputElement

            let sliderValue = target.value as unknown as number
            if (sliderValue > 1) {
                sliderValue = Math.round(1 + (sliderValue - 1) * 10)
            }

            setSpeed(sliderValue)
        })

        speedReset.addEventListener('click', () => {
            speedSlider.value = 1
            setSpeed(1)
        })

        spaceVelocity.addEventListener('change', (e: InputEvent) => {
            const target = e.target as HTMLInputElement

            if (target.checked) {
                speedSlider.max = 9.9
            } else {
                speedSlider.max = 1.9
                speedSlider.value = 1
                setSpeed(1)
            }
        })

        xray.addEventListener('change', (e: InputEvent) => {
            const target = e.target as HTMLInputElement
            this.enableXRay = target.checked
        })

        const episode: Episode = Object.values(this.engine.globalScope).find((object: Type<any>) => object.definition.TYPE === 'EPISODE')
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

        sceneChangeButton.addEventListener('click', () => {
            this.engine.changeScene(sceneSelector.value)
        })
    }

    updateCurrentScene (){
        if (this.isDebug) {
            const currentScene = document.querySelector('#currentScene')!
            currentScene.textContent = this.engine.currentScene!.definition.NAME
        }

        for (const [name, container] of this.xrays) {
            container.destroy({
                children: true
            })
            this.xrays.delete(name)
        }
    }

    updateXRay() {
        if (!this.enableXRay) {
            for (const [name, container] of this.xrays) {
                container.destroy({
                    children: true
                })
                this.xrays.delete(name)
            }
            return
        }

        for (const object of Object.values(this.engine.scope)) {
            if (!(object instanceof DisplayType) && !(object instanceof Button)) {
                continue
            }

            let rectangle: Rectangle
            let visible: boolean
            let isInteractive: boolean
            let position: string = 'inside'

            if (object instanceof DisplayType) {
                const renderObject: Sprite | null = object.getRenderObject()
                if (renderObject === null) {
                    continue
                }

                rectangle = renderObject.getBounds()
                visible = renderObject.visible

                const listenersCount = renderObject.listenerCount('pointerover')
                    + renderObject.listenerCount('pointerout')
                    + renderObject.listenerCount('pointerdown')
                    + renderObject.listenerCount('pointerup')

                isInteractive = listenersCount > 0
                position = 'inside'
            } else {
                const area = object.getArea()
                if (area === null) {
                    continue
                }

                rectangle = area
                visible = true
                isInteractive = true
                position = 'outside'
            }

            if (!visible) {
                this.xrays.get(object.name)?.destroy({
                    children: true
                })
                this.xrays.delete(object.name)
                continue
            }

            if (this.xrays.has(object.name)) {
                const oldRectangle = this.xrays.get(object.name)!
                if (oldRectangle.x === rectangle.x && oldRectangle.y === rectangle.y && oldRectangle.width === rectangle.width && oldRectangle.height === rectangle.height) {
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

            const drawRect = new Rectangle(rectangle.x, rectangle.y, rectangle.width, rectangle.height)
            if (isInteractive) {
                drawRectangle(graphics, drawRect, 0, 0, 1, 0x00ff00)
            } else {
                drawRectangle(graphics, drawRect, 0, 0, 1, 0x0000ff)
            }

            nameText.style = {
                fontSize: position === 'outside' ? 7 : 11,
                fontWeight: 'bold',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 2,
            }
            nameText.x = rectangle.x + (position === 'outside' ? 0 : 5)
            nameText.y = rectangle.y + (position === 'outside' ? -11 : 5)

            if (object instanceof Animo && eventText !== null) {
                eventText.style = {
                    fontSize: 8,
                    fill: '#00ffff',
                    stroke: '#000000',
                    strokeThickness: 2,
                }
                eventText.x = position === 'outside' ? rectangle.x : rectangle.x + 5
                eventText.y = (position === 'outside' ? rectangle.y - 15 : rectangle.y) + 5 + 12
            }
        }
    }
}

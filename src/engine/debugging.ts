import {Episode} from './types/episode'
import {DisplayType, Type} from './types'
import {Engine} from './index'
import {sound} from '@pixi/sound'
import {ArchiveOrgFileLoader, GithubFileLoader} from './filesLoader'
import {drawRectangle} from '../utils'
import {Container, Graphics, Rectangle, Sprite, Text} from 'pixi.js'
import {Animo} from './types/animo'
import {Button} from './types/button'

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

        debug.querySelector('#speed').addEventListener('input', (e: InputEvent) => {
            const target = e.target as HTMLInputElement

            let sliderValue = target.value as unknown as number
            if (sliderValue > 1) {
                sliderValue = Math.round(1 + (sliderValue - 1) * 10)
            }

            this.engine.speed = sliderValue
            this.engine.app.ticker.speed = sliderValue
            sound.speedAll = sliderValue
            debug.querySelector('#speedDisplay').textContent = `(${sliderValue}x)`
        })

        debug.querySelector('#speedReset').addEventListener('click', (e: InputEvent) => {
            debug.querySelector('#speed').value = 1
            this.engine.speed = 1
            this.engine.app.ticker.speed = 1
            sound.speedAll = 1
            debug.querySelector('#speedDisplay').textContent = '(1x)'
        })

        debug.querySelector('#xray').addEventListener('change', (e: InputEvent) => {
            const target = e.target as HTMLInputElement
            this.enableXRay = target.checked
        })

        const episode: Episode = Object.values(this.engine.globalScope).find((object: Type<any>) => object.definition.TYPE === 'EPISODE')
        const container: any = document.querySelector('#sceneSelector')!
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
            container.appendChild(option)
        }
        const button = document.querySelector('#changeScene')!
        button.addEventListener('click', () => {
            this.engine.changeScene(container.value)
        })
    }

    updateCurrentScene (){
        if (this.isDebug) {
            const currentScene = document.querySelector('#currentScene')!
            currentScene.textContent = this.engine.currentScene!.definition.NAME
        }

        for (const [name, sprite] of this.xrays) {
            this.engine.app.stage.removeChild(sprite)
            this.xrays.delete(name)
        }
    }

    updateXRay() {
        if (!this.enableXRay) {
            for (const [name, sprite] of this.xrays) {
                this.engine.app.stage.removeChild(sprite)
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

            if (this.xrays.has(object.name)) {
                const oldRectangle = this.xrays.get(object.name)!
                if (oldRectangle.x === rectangle.x && oldRectangle.y === rectangle.y && oldRectangle.width === rectangle.width && oldRectangle.height === rectangle.height) {
                    continue
                }

                this.engine.app.stage.removeChild(this.xrays.get(object.name)!)
                this.xrays.delete(object.name)
            }

            if (!visible) {
                continue
            }

            const drawRect = new Rectangle(rectangle.x, rectangle.y, rectangle.width, rectangle.height)
            const graphics = new Graphics()

            if (isInteractive) {
                drawRectangle(graphics, drawRect, 0, 0, 1, 0x00ff00)
            } else {
                drawRectangle(graphics, drawRect, 0, 0, 1, 0x0000ff)
            }

            const container = new Container()
            container.eventMode = 'none'

            const texture = this.engine.app.renderer.generateTexture(graphics)
            const sprite = new Sprite(texture)
            sprite.zIndex = 99999999
            sprite.x = rectangle.x
            sprite.y = rectangle.y
            container.addChild(sprite)

            const nameText = new Text(object.name)
            nameText.style.fontSize = position === 'outside' ? 7 : 11
            nameText.style.fontWeight = 'bold'
            nameText.style.fill = '#ff0000'
            nameText.style.stroke = '#000000'
            nameText.style.strokeThickness = 2
            nameText.x = (position === 'outside' ? rectangle.x : rectangle.x + 5)
            nameText.y = (position === 'outside' ? rectangle.y - 16 : rectangle.y) + 5
            container.addChild(nameText)

            if (object instanceof Animo) {
                const eventText = new Text(object.GETEVENTNAME())
                eventText.style.fontSize = 8
                eventText.style.fill = '#00ffff'
                eventText.style.stroke = '#000000'
                eventText.style.strokeThickness = 2
                eventText.x = position === 'outside' ? rectangle.x : rectangle.x + 5
                eventText.y = (position === 'outside' ? rectangle.y - 15 : rectangle.y) + 5 + 12
                container.addChild(eventText)
            }

            this.engine.app.stage.addChild(container)
            this.xrays.set(object.name, container)
        }
    }
}

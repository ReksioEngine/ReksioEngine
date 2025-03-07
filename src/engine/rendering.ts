import { Application, DisplayObject, Graphics, IPointData, Rectangle, Sprite, Text, TextStyle, Texture } from 'pixi.js'
import { assert } from '../common/errors'
import { DisplayType } from './types'

export class RenderingManager {
    public displayObjectsInDefinitionOrder: DisplayType<any>[] = []

    private readonly canvasBackground: Sprite
    private readonly blackTexture

    public readonly loadingDarkOverlay: Sprite
    public readonly loadingText: Text

    constructor(private app: Application) {
        this.blackTexture = createColorTexture(
            this.app,
            new Rectangle(0, 0, this.app.view.width, this.app.view.height),
            0
        )
        this.canvasBackground = new Sprite(this.blackTexture)
        this.canvasBackground.zIndex = -99999
        this.canvasBackground.name = 'Scene Background' // For PIXI Devtools

        this.loadingDarkOverlay = Sprite.from(
            createColorTexture(this.app, new Rectangle(0, 0, this.app.view.width, this.app.view.height), 0x000000, 0.5)
        )
        this.loadingText = new Text(
            'Loading..',
            new TextStyle({
                fontFamily: 'Arial',
                fontSize: 36,
                fontWeight: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
                wordWrap: true,
                wordWrapWidth: 440,
                lineJoin: 'round',
            })
        )
        this.loadingText.x = this.app.view.width / 2
        this.loadingText.y = this.app.view.height / 2
        this.loadingText.anchor.set(0.5, 0.5)
    }

    init() {
        this.app.ticker.maxFPS = 60
        this.app.stage.interactive = true

        this.app.stage.name = 'Scene' // For PIXI Devtools
        this.app.stage.addChild(this.canvasBackground)
    }

    onSceneChange() {
        this.displayObjectsInDefinitionOrder = []
        this.resetCursor()
    }

    setBackground(texture: Texture) {
        this.canvasBackground.texture = texture
    }

    clearBackground() {
        this.canvasBackground.texture = this.blackTexture
    }

    setCursor(mode: string) {
        this.app.renderer.events.cursorStyles.default = mode
        this.app.renderer.events.setCursor(mode)
    }

    resetCursor() {
        this.setCursor('auto')
    }

    addToStage(sprite: DisplayObject) {
        this.app.stage.addChild(sprite)
        this.sortObjects()
    }

    removeFromStage(sprite: DisplayObject) {
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
}

export class AdvancedSprite extends Sprite {
    public hitmap?: Uint8Array
    public checkPixelPerfect = false

    getAlphaAt(point: IPointData) {
        assert(this.hitmap !== undefined)

        const tempPoint = { x: 0, y: 0 }
        this.worldTransform.applyInverse(point, tempPoint)

        const width = this._texture.orig.width
        const height = this._texture.orig.height
        const x = Math.floor(tempPoint.x + width * this.anchor.x)
        const y = Math.floor(tempPoint.y + height * this.anchor.y)

        if (x < 0 || x > width || y < 0 || y > height) {
            return 0 // unsure
        }

        const pixelOffset = y * width + x
        if (pixelOffset > this.hitmap.length - 1) {
            return 0 // unsure
        }

        return this.hitmap[pixelOffset]
    }

    containsPoint(point: IPointData) {
        if (!this.checkPixelPerfect || !this.hitmap) {
            return super.containsPoint(point)
        }
        return this.containsPointWithAlpha(point)
    }

    containsPointWithAlpha(point: IPointData) {
        const alpha = this.getAlphaAt(point)
        return alpha !== null && alpha > 0
    }
}

export const createHitmapFromImageBytes = (bytes: Uint8Array) => {
    const hitmap = new Uint8Array(bytes.byteLength / 4)
    for (let i = 0; i < hitmap.byteLength; i++) {
        hitmap[i] = bytes[i * 4 + 3]
    }
    return hitmap
}

export const drawRectangle = (
    graphics: Graphics,
    dimensions: Rectangle,
    color: number,
    alpha?: number,
    borderWidth?: number,
    borderColor?: number
) => {
    graphics.beginFill(color, alpha)
    if (borderWidth !== undefined && borderWidth > 0) {
        graphics.lineStyle(borderWidth, borderColor ?? 0xffa500)
    }
    graphics.drawRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height)
}

export const createColorTexture = (app: Application, dimensions: Rectangle, color: number, alpha?: number) => {
    const graphics = new Graphics()
    drawRectangle(graphics, dimensions, color, alpha)
    return app.renderer.generateTexture(graphics)
}

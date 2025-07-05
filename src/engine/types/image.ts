import { DisplayType } from './index'
import { ImageDefinition } from '../../fileFormats/cnv/types'
import { assert, NotImplementedError } from '../../common/errors'
import { Container, Graphics, Point, Sprite } from 'pixi.js'
import { loadSprite } from '../../loaders/assetsLoader'
import { AdvancedSprite } from '../rendering'
import { method } from '../../common/types'
import * as PIXI from 'pixi.js'

export class Image extends DisplayType<ImageDefinition> {
    public sprite: AdvancedSprite | null = null

    async init() {
        await this.initSprite(this.definition.FILENAME)
    }

    async applyDefaults() {
        this.SETPRIORITY(this.definition.PRIORITY ?? 0)
    }

    private async initSprite(path: string) {
        this.sprite = await this.load(path)
        this.sprite.visible = this.definition.VISIBLE
        this.sprite.eventMode = 'none'
        this.sprite.name = `${this.name} (IMAGE)` // For PIXI Devtools
    }

    private async load(path: string) {
        assert(this.engine.currentScene !== null)
        const relativePath = this.engine.currentScene.getRelativePath(path)
        return await loadSprite(this.engine.fileLoader, relativePath)
    }

    async ready() {
        assert(this.sprite !== null)
        this.engine.rendering.addToStage(this.sprite)
        await this.callbacks.run('ONINIT')
    }

    destroy() {
        assert(this.sprite !== null)
        this.engine.rendering.removeFromStage(this.sprite)
    }

    @method()
    SETOPACITY(opacity: number) {
        throw new NotImplementedError()
    }

    @method()
    MOVE(xOffset: number, yOffset: number) {
        assert(this.sprite !== null)
        this.sprite.x += xOffset
        this.sprite.y += yOffset
    }

    @method()
    SETPOSITION(x: number, y: number) {
        assert(this.sprite !== null)
        this.sprite.x = x
        this.sprite.y = y
    }

    @method()
    SHOW() {
        assert(this.sprite !== null)
        this.sprite.visible = true
    }

    @method()
    HIDE() {
        assert(this.sprite !== null)
        this.sprite.visible = false
    }

    @method()
    GETPOSITIONY() {
        assert(this.sprite !== null)
        return this.sprite.y
    }

    @method()
    GETALPHA(x: number, y: number) {
        assert(this.sprite !== null)
        return this.sprite.getAlphaAt(new Point(x, y))
    }

    private maskContainer: Container | null = null
    private otherObjectsAlphaSpriteCache = new Map<string, Sprite>()

    @method()
    MERGEALPHA(x: number, y: number, name: string) {
        assert(this.sprite !== null)

        if (this.maskContainer === null) {
            const maskGraphics = new Graphics()

            maskGraphics.beginTextureFill({
                texture: this.generateMaskTexture(this.sprite),
                color: 0xffffff,
            })
            maskGraphics.drawRect(0, 0, this.sprite.width, this.sprite.height)
            maskGraphics.endFill()

            this.maskContainer = new Container()
            this.maskContainer.addChild(maskGraphics)
        }

        const object = this.engine.getObject(name)

        let otherObjectAlphaSprite = this.otherObjectsAlphaSpriteCache.get(name)
        if (!otherObjectAlphaSprite) {
            otherObjectAlphaSprite = new Sprite(this.generateMaskTexture(object.getRenderObject()))
            this.otherObjectsAlphaSpriteCache.set(name, otherObjectAlphaSprite)
            this.maskContainer.addChild(otherObjectAlphaSprite)
        }

        otherObjectAlphaSprite.x = x
        otherObjectAlphaSprite.y = y
        this.sprite.mask = new Sprite(this.engine.app.renderer.generateTexture(this.maskContainer))
    }

    @method()
    async LOAD(path: string) {
        this.destroy()
        await this.initSprite(path)

        assert(this.sprite !== null)
        this.engine.rendering.addToStage(this.sprite)
    }

    private generateMaskTexture(sprite: AdvancedSprite) {
        assert(sprite.hitmap !== undefined)
        const textureBytes = new Uint8Array(sprite.hitmap.length * 4)

        let newPos = 0
        for (let i = 0; i < sprite.hitmap.length; i++) {
            textureBytes[newPos++] = sprite.hitmap[i]
            textureBytes[newPos++] = sprite.hitmap[i]
            textureBytes[newPos++] = sprite.hitmap[i]
            textureBytes[newPos++] = 255
        }

        return new PIXI.Texture(PIXI.BaseTexture.fromBuffer(new Uint8Array(textureBytes), sprite.width, sprite.height))
    }

    getRenderObject() {
        return this.sprite
    }
}

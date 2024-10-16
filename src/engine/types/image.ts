import {DisplayType} from './index'
import {Engine} from '../index'
import {ImageDefinition} from '../../fileFormats/cnv/types'
import {assert, NotImplementedError} from '../../errors'
import {Point} from 'pixi.js'
import {loadSprite} from '../assetsLoader'
import {AdvancedSprite} from '../rendering'

export class Image extends DisplayType<ImageDefinition> {
    public sprite: AdvancedSprite | null = null

    constructor(engine: Engine, definition: ImageDefinition) {
        super(engine, definition)
        this.callbacks.register('ONINIT', this.definition.ONINIT)
    }

    async init() {
        this.sprite = await this.load()
        this.sprite.visible = this.definition.VISIBLE
        this.sprite.eventMode = 'none'
        this.SETPRIORITY(this.definition.PRIORITY ?? 0)
    }

    ready() {
        assert(this.sprite !== null)
        this.engine.addToStage(this.sprite)
        this.callbacks.run('ONINIT')
    }

    destroy() {
        assert(this.sprite !== null)
        this.engine.removeFromStage(this.sprite)
    }

    private async load() {
        assert(this.engine.currentScene !== undefined)
        const relativePath = this.engine.currentScene.getRelativePath(this.definition.FILENAME)
        const sprite = await loadSprite(this.engine.fileLoader, relativePath)
        if (sprite == null) {
            throw new Error(`Cannot load image '${this.definition.FILENAME}'`)
        }

        return sprite
    }

    SETOPACITY(opacity: number) {
        throw new NotImplementedError()
    }

    MOVE(xOffset: number, yOffset: number) {
        assert(this.sprite !== null)
        this.sprite.x += xOffset
        this.sprite.y += yOffset
    }

    SETPOSITION(x: number, y: number) {
        assert(this.sprite !== null)
        this.sprite.x = x
        this.sprite.y = y
    }

    SHOW() {
        assert(this.sprite !== null)
        this.sprite.visible = true
    }

    HIDE() {
        assert(this.sprite !== null)
        this.sprite.visible = false
    }

    GETPOSITIONY() {
        assert(this.sprite !== null)
        return this.sprite.y
    }

    GETALPHA(x: number, y: number) {
        assert(this.sprite !== null)
        return this.sprite.getAlphaAt(new Point(x, y))
    }

    getRenderObject() {
        return this.sprite
    }
}

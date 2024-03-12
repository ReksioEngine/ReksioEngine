import {Type} from './index'
import {Engine} from '../index'
import {ImageDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'
import {assert} from '../../errors'
import {Sprite} from 'pixi.js'
import {loadSprite} from '../assetsLoader'

export class Image extends Type<ImageDefinition> {
    public sprite: Sprite | null = null

    constructor(engine: Engine, definition: ImageDefinition) {
        super(engine, definition)
        this.callbacks.register('ONINIT', this.definition.ONINIT)
    }

    async init() {
        this.sprite = await this.load()
        this.sprite.visible = this.definition.VISIBLE
        this.SETPRIORITY(this.definition.PRIORITY)
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

    SETPRIORITY(priority: number) {
        assert(this.sprite !== null)
        this.sprite.zIndex = priority
        this.sprite.sortChildren()
    }

    SHOW() {
        assert(this.sprite !== null)
        this.sprite.visible = true
        this.sprite.interactive = true
    }

    HIDE() {
        assert(this.sprite !== null)
        this.sprite.visible = false
        this.sprite.interactive = false
    }

    GETPOSITIONY() {
        assert(this.sprite !== null)
        return this.sprite.y
    }

    GETALPHA(x: number, y: number) {
        throw new NotImplementedError()
    }
}

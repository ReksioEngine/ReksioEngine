import { DisplayType } from './index'
import { ImageDefinition } from '../../fileFormats/cnv/types'
import { assert, NotImplementedError } from '../../common/errors'
import { Point } from 'pixi.js'
import { loadSprite } from '../assetsLoader'
import { AdvancedSprite } from '../rendering'
import { method } from '../../common/types'

export class Image extends DisplayType<ImageDefinition> {
    public sprite: AdvancedSprite | null = null

    async init() {
        this.sprite = await this.load()
        this.sprite.visible = this.definition.VISIBLE
        this.sprite.eventMode = 'none'
        this.sprite.name = `${this.name} (IMAGE)` // For PIXI Devtools
    }

    applyDefaults() {
        this.SETPRIORITY(this.definition.PRIORITY ?? 0)
    }

    private async load() {
        assert(this.engine.currentScene !== undefined)

        const relativePath = this.engine.currentScene.getRelativePath(this.definition.FILENAME)
        return await loadSprite(this.engine.fileLoader, relativePath)
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

    @method()
    MERGEALPHA(x: number, y: number, name: string) {
        throw new NotImplementedError()
    }

    getRenderObject() {
        return this.sprite
    }
}

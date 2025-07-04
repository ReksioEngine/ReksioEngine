import { Type } from './index'
import { FontDefinition } from '../../fileFormats/cnv/types'
import { BitmapFont } from 'pixi.js'
import { FileNotFoundError } from '../../loaders/filesLoader'
import { assert } from '../../common/errors'

export class Font extends Type<FontDefinition> {
    public bitmapFont: BitmapFont | null = null

    async init() {
        assert(this.engine.currentScene !== null)

        try {
            const relativePath = this.engine.currentScene.getRelativePath(this.definition['DEF_%s_%s_%d'])
            this.bitmapFont = await this.engine.fileLoader.getFNTFile(relativePath)
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                console.warn('FNT file not found')
            }
        }
    }

    ready() {
        this.callbacks.run('ONINIT')
    }
}

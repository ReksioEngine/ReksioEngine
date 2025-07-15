import { Type } from './index'
import { FontDefinition } from '../../fileFormats/cnv/types'
import { BitmapFont } from 'pixi.js'
import { FileNotFoundError } from '../../loaders/filesLoader'

export class Font extends Type<FontDefinition> {
    public bitmapFont: BitmapFont | null = null

    async init() {
        try {
            const filename = this.definition['DEF_%s_%s_%d']
            const relativePath = this.engine.currentScene !== null
                ? this.engine.currentScene.getRelativePath(filename)
                : this.engine.resolvePath(filename)
            this.bitmapFont = await this.engine.fileLoader.getFNTFile(relativePath)
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                console.warn('FNT file not found')
            }
        }
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }
}

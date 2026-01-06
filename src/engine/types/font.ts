import { Type } from './index'
import { FontDefinition } from '../../fileFormats/cnv/types'
import { BitmapFont } from 'pixi.js'
import { FileNotFoundError } from '../../filesystem/fileLoader'
import { logger } from '../logging'

export class Font extends Type<FontDefinition> {
    public bitmapFont: BitmapFont | null = null

    async init() {
        const filename = this.definition['DEF_%s_%s_%d']
        try {
            const relativePath = this.engine.currentScene !== null
                ? await this.engine.currentScene.getRelativePath(filename)
                : await this.engine.resolvePath(filename)
            this.bitmapFont = await this.engine.filesystem.getFNTFile(relativePath)
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                logger.warn(`FNT file not found at "${filename}"`, {
                    font: this
                })
            }
        }
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }
}

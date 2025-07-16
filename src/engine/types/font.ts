import { Type } from './index'
import { FontDefinition } from '../../fileFormats/cnv/types'
import { BitmapFont } from 'pixi.js'
import { FileNotFoundError } from '../../filesystem/fileLoader'

export class Font extends Type<FontDefinition> {
    public bitmapFont: BitmapFont | null = null

    async init() {
        try {
            const filename = this.definition['DEF_%s_%s_%d']
            const relativePath = this.engine.currentScene !== null
                ? await this.engine.currentScene.getRelativePath(filename)
                : await this.engine.resolvePath(filename)
            this.bitmapFont = await this.engine.filesystem.getFNTFile(relativePath)
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

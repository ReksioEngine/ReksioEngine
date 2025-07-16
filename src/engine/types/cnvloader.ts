import { Type } from './index'
import { CNVLoaderDefinition } from '../../fileFormats/cnv/types'
import { assert } from '../../common/errors'
import { method } from '../../common/types'
import { doReady, loadDefinition } from '../../filesystem/definitionLoader'

export class CNVLoader extends Type<CNVLoaderDefinition> {
    @method()
    async LOAD(filename: string) {
        assert(this.engine.currentScene !== null)
        const definition = await this.engine.filesystem.getCNVFile(
            await this.engine.currentScene.getRelativePath(filename)
        )

        assert(this.parent?.scope)
        await loadDefinition(this.engine, this.parent.scope, definition, this.engine.currentScene)
        await doReady(this.parent.scope)
    }
}

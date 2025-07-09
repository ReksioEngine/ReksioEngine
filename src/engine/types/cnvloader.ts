import { Type } from './index'
import { CNVLoaderDefinition } from '../../fileFormats/cnv/types'
import { assert } from '../../common/errors'
import { method } from '../../common/types'
import { doReady, loadDefinition } from '../../loaders/definitionLoader'

export class CNVLoader extends Type<CNVLoaderDefinition> {
    @method()
    async LOAD(filename: string) {
        assert(this.engine.currentScene !== null)
        const definition = await this.engine.fileLoader.getCNVFile(
            this.engine.currentScene.getRelativePath(filename)
        )

        const sceneScope = this.engine.scopeManager.getScope('scene')
        assert(sceneScope !== null)
        await loadDefinition(this.engine, sceneScope, definition, this.engine.currentScene)
        await doReady(sceneScope)
    }
}

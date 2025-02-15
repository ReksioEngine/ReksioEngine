import { Type } from './index'
import { EpisodeDefinition } from '../../fileFormats/cnv/types'
import { assert } from '../../common/errors'
import { pathJoin } from '../../common/utils'
import { loadDefinition } from '../../loaders/definitionLoader'
import { FileNotFoundError } from '../../loaders/filesLoader'
import { method } from '../../common/types'
import { CancelTick } from '../index'

export class Episode extends Type<EpisodeDefinition> {
    async init() {
        if (this.definition.PATH) {
            try {
                const applicationDefinition = await this.engine.fileLoader.getCNVFile(
                    pathJoin('DANE', this.definition.PATH, this.name + '.cnv')
                )
                await loadDefinition(
                    this.engine,
                    this.engine.scopeManager.newScope('episode'),
                    applicationDefinition,
                    this
                )
            } catch (err) {
                if (err! instanceof FileNotFoundError) {
                    throw err
                }
            }
        }
    }

    @method()
    GOTO(sceneName: string) {
        assert(this.definition.SCENES.includes(sceneName))
        throw new CancelTick(async () => await this.engine.changeScene(sceneName))
    }

    @method()
    GETLATESTSCENE() {
        return this.engine.previousScene?.definition.NAME ?? null
    }

    @method()
    BACK() {
        if (this.engine.previousScene) {
            this.GOTO(this.engine.previousScene.definition.NAME)
        } else {
            console.warn('Attempted EPISODE^BACK() but there is no previous scene')
        }
    }
}

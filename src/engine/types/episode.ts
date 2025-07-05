import { Type } from './index'
import { EpisodeDefinition } from '../../fileFormats/cnv/types'
import { assert } from '../../common/errors'
import { pathJoin } from '../../common/utils'
import { loadDefinition, doReady } from '../../loaders/definitionLoader'
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

                this.engine.app.ticker.stop()
                const episodeScope = this.engine.scopeManager.newScope('episode')
                await loadDefinition(this.engine, episodeScope, applicationDefinition, this)
                doReady(episodeScope)
                this.engine.app.ticker.start()
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
    GETCURRENTSCENE() {
        return this.engine.currentScene?.name ?? null
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

import { ParentType } from './index'
import { EpisodeDefinition } from '../../fileFormats/cnv/types'
import { assert, CancelTick } from '../../common/errors'
import { loadDefinition, doReady } from '../../filesystem/definitionLoader'
import { method } from '../../common/types'
import { pathJoin } from '../../filesystem'
import { logger } from '../logging'

export class Episode extends ParentType<EpisodeDefinition> {
    async init() {
        if (this.definition.PATH !== undefined) {
            const applicationDefinition = await this.engine.filesystem.getCNVFile(
                pathJoin('DANE', this.definition.PATH, this.name + '.cnv')
            )

            this.engine.app.ticker.stop()
            this.scope = this.engine.scopeManager.newScope('episode')
            await loadDefinition(this.engine, this.scope, applicationDefinition, this)
            await doReady(this.scope)
            this.engine.app.ticker.start()
        }
    }

    @method()
    GOTO(sceneName: string) {
        this.goto(sceneName)
    }

    private goto(sceneName: string) {
        assert(this.definition.SCENES.includes(sceneName))
        throw new CancelTick(async () => await this.engine.changeScene(sceneName))
    }

    @method()
    GETLATESTSCENE(): string | null {
        return this.engine.previousScene?.definition.NAME ?? null
    }

    @method()
    GETCURRENTSCENE(): string | null {
        return this.engine.currentScene?.name ?? null
    }

    @method()
    BACK() {
        if (this.engine.previousScene) {
            this.goto(this.engine.previousScene.definition.NAME)
        } else {
            logger.warn('Attempted EPISODE^BACK() but there is no previous scene', {
                episode: this,
            })
        }
    }
}

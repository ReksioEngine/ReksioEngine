import { Type } from './index'
import { EpisodeDefinition } from '../../fileFormats/cnv/types'
import { Scene } from './scene'
import { assert } from '../../errors'
import { pathJoin } from '../../utils'
import { loadDefinition } from '../definitionLoader'
import { FileNotFoundError } from '../filesLoader'
import { method } from '../../types'

export class Episode extends Type<EpisodeDefinition> {
    private previousScene?: Scene

    async init() {
        if (this.definition.PATH) {
            try {
                const applicationDefinition = await this.engine.fileLoader.getCNVFile(
                    pathJoin('DANE', this.definition.PATH, this.name + '.cnv')
                )
                await loadDefinition(this.engine, this.engine.globalScope, applicationDefinition, this)
            } catch (err) {
                if (err! instanceof FileNotFoundError) {
                    throw err
                }
            }
        }
    }

    ready() {
        this.GOTO(this.definition.STARTWITH)
    }

    @method()
    async GOTO(sceneName: string) {
        assert(this.definition.SCENES.includes(sceneName))

        this.previousScene = this.engine.currentScene
        await this.engine.changeScene(sceneName)
    }

    @method()
    GETLATESTSCENE() {
        return this.previousScene?.definition.NAME ?? null
    }

    @method()
    async BACK() {
        if (this.previousScene) {
            await this.GOTO(this.previousScene.definition.NAME)
        } else {
            console.warn('Attempted EPISODE^BACK() but there is no previous scene')
        }
    }
}

import {Type} from './index'
import {EpisodeDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {Scene} from './scene'
import {assert} from '../../errors'
import {pathJoin} from '../../utils'
import {loadDefinition} from '../definitionLoader'
import {FileNotFoundError} from '../filesLoader'

export class Episode extends Type<EpisodeDefinition> {
    private previousScene?: Scene

    constructor(engine: Engine, definition: EpisodeDefinition) {
        super(engine, definition)
    }

    async init() {
        if (this.definition.PATH) {
            try {
                const applicationDefinition = await this.engine.fileLoader.getCNVFile(pathJoin('DANE', this.definition.PATH, this.name + '.cnv'))
                await loadDefinition(this.engine, this.engine.globalScope, applicationDefinition, this)
            } catch (err) {
                if (err !instanceof FileNotFoundError) {
                    throw err
                }
            }
        }
    }

    ready() {
        this.GOTO(this.definition.STARTWITH)
    }

    async GOTO(sceneName: string) {
        assert(this.definition.SCENES.includes(sceneName))

        this.previousScene = this.engine.currentScene
        await this.engine.changeScene(sceneName)
    }

    GETLATESTSCENE() {
        // TODO: read from save file
        return this.definition.STARTWITH
    }

    async BACK() {
        if (this.previousScene) {
            await this.GOTO(this.previousScene.definition.NAME)
        }
    }
}

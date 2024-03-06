import {Type} from './index'
import {EpisodeDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {Scene} from './scene'

export class Episode extends Type<EpisodeDefinition> {
    private previousScene?: Scene

    constructor(engine: Engine, definition: EpisodeDefinition) {
        super(engine, definition)
    }

    start() {
        this.GOTO(this.definition.STARTWITH)
    }

    async GOTO(sceneName: string) {
        if (this.definition.SCENES.includes(sceneName)) {
            this.previousScene = this.engine.currentScene
            await this.engine.changeScene(sceneName)
        }
    }

    GETLATESTSCENE() {
        // TODO: read from save file
        return this.definition.STARTWITH
    }

    async BACK() {
        if (this.previousScene) {
            await this.GOTO(this.previousScene.definition._NAME)
        }
    }
}

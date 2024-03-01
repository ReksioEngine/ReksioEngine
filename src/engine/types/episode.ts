import {Type} from './index'
import {EpisodeDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError, pathJoin} from '../../utils'
import {loadScene} from '../sceneLoader'
import {getCNVFile} from '../../filesLoader'
import {Scene} from './scene'

export class Episode extends Type<EpisodeDefinition> {
    constructor(engine: Engine, definition: EpisodeDefinition) {
        super(engine, definition)
    }

    start() {
        this.GOTO(this.definition.STARTWITH)
    }

    async GOTO(sceneName: string) {
        if (!this.definition.SCENES.includes(sceneName)) {
            return
        }

        for (const object of Object.values(this.engine.scope)) {
            object.destroy()
        }

        const scene: Scene = this.engine.getObject(sceneName)
        const sceneDefinition = await getCNVFile(pathJoin('DANE', scene.definition.PATH, sceneName + '.cnv'))
        loadScene(this.engine, sceneDefinition)
    }

    BACK() {
        throw new NotImplementedError()
    }
}

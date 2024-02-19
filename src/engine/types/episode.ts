import {Type} from './index'
import {EpisodeDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'

export class Episode extends Type<EpisodeDefinition> {
    constructor(engine: Engine, definition: EpisodeDefinition) {
        super(engine, definition)
    }

    GOTO(sceneName: string) {
        throw NotImplementedError
    }

    BACK() {
        throw NotImplementedError
    }
}

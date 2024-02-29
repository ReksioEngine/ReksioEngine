import {Type} from './index'
import {ApplicationDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'

export class Application extends Type<ApplicationDefinition> {
    constructor(engine: Engine, definition: ApplicationDefinition) {
        super(engine, definition)
    }

    init() {
        const currentEpisode = this.engine.getObject(this.definition.STARTWITH)
        currentEpisode.start()
    }

    SETLANGUAGE(langCode: string) {
        throw NotImplementedError
    }

    GETLANGUAGE() {
        throw NotImplementedError
    }

    RUN() {
        throw NotImplementedError
    }

    EXIT() {
        throw NotImplementedError
    }
}

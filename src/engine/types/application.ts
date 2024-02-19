import {Type} from './index'
import {ApplicationDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'

export class Application extends Type<ApplicationDefinition> {
    constructor(engine: Engine, definition: ApplicationDefinition) {
        super(engine, definition)
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

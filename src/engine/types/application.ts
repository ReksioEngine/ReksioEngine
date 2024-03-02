import {Type} from './index'
import {ApplicationDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError, pathJoin} from '../../utils'
import {getCNVFile} from '../../filesLoader'
import {loadDefinition} from '../definitionLoader'

export class Application extends Type<ApplicationDefinition> {
    constructor(engine: Engine, definition: ApplicationDefinition) {
        super(engine, definition)
    }

    async init() {
        const currentEpisode = this.engine.getObject(this.definition.STARTWITH)

        const episodeDefinition = await getCNVFile(pathJoin('DANE', currentEpisode.definition.PATH, this.definition.STARTWITH + '.cnv'))
        await loadDefinition(this.engine, episodeDefinition)

        currentEpisode.start()
    }

    SETLANGUAGE(langCode: string) {
        throw new NotImplementedError()
    }

    GETLANGUAGE() {
        throw new NotImplementedError()
    }

    RUN() {
        throw new NotImplementedError()
    }

    EXIT() {
        throw new NotImplementedError()
    }
}

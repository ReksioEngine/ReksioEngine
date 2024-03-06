import {Type} from './index'
import {ApplicationDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError, pathJoin} from '../../utils'
import {loadDefinition} from '../definitionLoader'

export class Application extends Type<ApplicationDefinition> {
    constructor(engine: Engine, definition: ApplicationDefinition) {
        super(engine, definition)
    }

    async init() {
        const currentEpisode = this.engine.getObject(this.definition.STARTWITH)

        if (currentEpisode.definition.PATH) {
            const episodeDefinition = await this.engine.fileLoader.getCNVFile(pathJoin('DANE', currentEpisode.definition.PATH, this.definition.STARTWITH + '.cnv'))
            await loadDefinition(this.engine, this.engine.globalScope, episodeDefinition, currentEpisode)
        }

        currentEpisode.start()
    }

    SETLANGUAGE(langCode: string) {
        throw new NotImplementedError()
    }

    GETLANGUAGE() {
        throw new NotImplementedError()
    }

    RUN(objectName: string, methodName: string, ...args: any[]) {
        return this.engine.getObject(objectName)[methodName](...args)
    }

    EXIT() {
        throw new NotImplementedError()
    }
}

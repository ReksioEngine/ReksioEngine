import {Type} from './index'
import {ApplicationDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {pathJoin} from '../../utils'
import {loadDefinition} from '../definitionLoader'
import {Episode} from './episode'
import {String} from './string'
import {NotImplementedError} from '../../errors'

export class Application extends Type<ApplicationDefinition> {
    private language: string = '0415'

    constructor(engine: Engine, definition: ApplicationDefinition) {
        super(engine, definition)
    }

    async init() {
        const currentEpisode: Episode = this.engine.getObject(this.definition.STARTWITH)

        if (currentEpisode.definition.PATH) {
            const episodeDefinition = await this.engine.fileLoader.getCNVFile(pathJoin('DANE', currentEpisode.definition.PATH, this.definition.STARTWITH + '.cnv'))
            await loadDefinition(this.engine, this.engine.globalScope, episodeDefinition, currentEpisode)
        }

        currentEpisode.start()
    }

    SETLANGUAGE(langCode: string) {
        this.language = langCode
    }

    GETLANGUAGE() {
        return this.language
    }

    RUN(objectName: string, methodName: string, ...args: any[]) {
        let object = this.engine.getObject(objectName)
        if (object instanceof String) {
            object = this.engine.getObject(object.value)
        }

        if (object[methodName]) {
            return object[methodName](...args)
        } else {
            return object.__call(methodName, ...args)
        }
    }

    EXIT() {
        throw new NotImplementedError()
    }
}

import {Type} from './index'
import {ApplicationDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {pathJoin} from '../../utils'
import {loadDefinition} from '../definitionLoader'
import {NotImplementedError} from '../../errors'
import {FileNotFoundError} from '../filesLoader'
import {method} from '../../types'

export class Application extends Type<ApplicationDefinition> {
    private language: string = 'POL'

    constructor(engine: Engine, definition: ApplicationDefinition) {
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

    @method()
    SETLANGUAGE(langCode: string) {
        switch (langCode) {
        case '0415':
            this.language = 'POL'
            break
        case '040E':
            this.language = 'HUN'
            break
        case '0405':
            this.language = 'CZE'
            break
        case '0418':
            this.language = 'ROU'
            break
        }
    }

    @method()
    GETLANGUAGE() {
        return this.language
    }

    @method()
    RUN(objectName: string, methodName: string, ...args: any[]) {
        const object = this.engine.getObject(objectName)
        if (object === null) {
            return
        }

        if (object[methodName]) {
            return object[methodName](...args)
        } else {
            return object.__call(methodName, args)
        }
    }

    @method()
    EXIT() {
        throw new NotImplementedError()
    }
}

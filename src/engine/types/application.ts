import { Type } from './index'
import { ApplicationDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { pathJoin } from '../../common/utils'
import { loadDefinition, doReady } from '../../loaders/definitionLoader'
import { FileNotFoundError } from '../../loaders/filesLoader'
import { method } from '../../common/types'

const langCodeMapping: Record<string, string> = {
    '0415': 'POL',
    '040E': 'HUN',
    '0405': 'CZE',
    '0418': 'ROU',
}

export class Application extends Type<ApplicationDefinition> {
    private language: string = 'POL'

    constructor(engine: Engine, parent: Type<any> | null, definition: ApplicationDefinition) {
        super(engine, parent, definition)
    }

    async init() {
        if (this.definition.PATH) {
            try {
                const applicationDefinition = await this.engine.fileLoader.getCNVFile(
                    pathJoin('DANE', this.definition.PATH, this.name + '.cnv')
                )

                this.engine.app.ticker.stop()
                const applicationScope = this.engine.scopeManager.newScope('application')
                await loadDefinition(this.engine, applicationScope, applicationDefinition, this)
                doReady(applicationScope)
                this.engine.app.ticker.start()
            } catch (err) {
                if (err! instanceof FileNotFoundError) {
                    throw err
                }
            }
        }
    }

    @method()
    SETLANGUAGE(langCode: string) {
        this.language = langCodeMapping[langCode]
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
        if (this.engine.options.onExit) {
            this.engine.options.onExit()
        }
    }
}

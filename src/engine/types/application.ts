import { Type } from './index'
import { ApplicationDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { loadDefinition, doReady } from '../../loaders/definitionLoader'
import { pathJoin } from '../../loaders/filesLoader'
import { method } from '../../common/types'

const langCodeMapping: Record<string, string> = {
    '0415': 'POL',
    '0405': 'CZE',
    '0402': 'BUL',
    '0418': 'ROM',
    '0419': 'RUS',
    '040E': 'HUN',
    '041B': 'SLO',
}

export class Application extends Type<ApplicationDefinition> {
    private language: string = 'POL'

    constructor(engine: Engine, parent: Type<any> | null, definition: ApplicationDefinition) {
        super(engine, parent, definition)
    }

    async init() {
        if (this.definition.PATH) {
            const applicationDefinition = await this.engine.fileLoader.getCNVFile(
                pathJoin('DANE', this.definition.PATH, this.name + '.cnv')
            )

            this.engine.app.ticker.stop()
            const applicationScope = this.engine.scopeManager.newScope('application')
            await loadDefinition(this.engine, applicationScope, applicationDefinition, this)
            await doReady(applicationScope)
            this.engine.app.ticker.start()
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
    async RUN(objectName: string, methodName: string, ...args: any[]) {
        const object: any = this.engine.getObject(objectName)
        if (object === null) {
            return
        }

        if (object[methodName]) {
            return await object[methodName](...args)
        } else {
            return await object.__call(methodName, args)
        }
    }

    @method()
    EXIT() {
        if (this.engine.options.onExit) {
            this.engine.options.onExit()
        }
    }
}

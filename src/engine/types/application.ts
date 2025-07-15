import { ParentType, Type } from './index'
import { ApplicationDefinition } from '../../fileFormats/cnv/types'
import { loadDefinition, doReady } from '../../loaders/definitionLoader'
import { pathJoin } from '../../loaders/filesLoader'
import { method } from '../../common/types'
import { assert } from '../../common/errors'
import { Scene } from './scene'
import { Behaviour } from './behaviour'

const langCodeMapping: Record<string, string> = {
    '0415': 'POL',
    '0405': 'CZE',
    '0402': 'BUL',
    '0418': 'ROM',
    '0419': 'RUS',
    '040E': 'HUN',
    '041B': 'SLO',
}

export class Application extends ParentType<ApplicationDefinition> {
    private language: string = 'POL'

    async init() {
        if (this.definition.PATH) {
            const applicationDefinition = await this.engine.fileLoader.getCNVFile(
                pathJoin('DANE', this.definition.PATH, this.name + '.cnv')
            )

            this.engine.app.ticker.stop()
            this.scope = this.engine.scopeManager.newScope('application')
            await loadDefinition(this.engine, this.scope, applicationDefinition, this)
            await doReady(this.scope)
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
        const object: any = this.getObject(objectName)
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
    async RUNENV(sceneName: string, behaviourName: string, ...args: any[]) {
        const object: Type<any> | null = this.getObject(sceneName)
        if (object === null) {
            return
        }

        assert(object instanceof Scene, 'attempted RUNENV on non-SCENE object')
        assert(object.scope)

        const behaviour: Type<any> | null = object.scope.get(behaviourName)
        if (behaviour === null) {
            return
        }

        assert(behaviour instanceof Behaviour)
        await behaviour.RUNC(...args)
    }

    @method()
    EXIT() {
        if (this.engine.options.onExit) {
            this.engine.options.onExit()
        }
    }
}

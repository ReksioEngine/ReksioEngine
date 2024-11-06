import {Type} from './index'
import {SceneDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {pathJoin} from '../../utils'
import {Behaviour} from './behaviour'
import {assert, NotImplementedError} from '../../errors'
import {method} from '../../types'

export class Scene extends Type<SceneDefinition> {
    constructor(engine: Engine, definition: SceneDefinition) {
        super(engine, definition)
    }

    @method()
    SETMUSICVOLUME(volume: number) {
        assert(this.engine.music !== null)
        this.engine.music.volume = volume / 1000
    }

    @method()
    SETMINHSPRIORITY(arg: number) {
        throw new NotImplementedError()
    }

    @method()
    RUNCLONES(baseObjectName: string, arg1: any, arg2: any, behaviourName: string) {
        const baseObject: Type<any> = this.engine.getObject(baseObjectName)
        const behaviour: Behaviour = this.engine.getObject(behaviourName)
        for (const clone of baseObject.clones) {
            behaviour.RUN(clone)
        }
    }

    @method()
    RUN(objectName: string, methodName: string, ...args: any[]) {
        return this.engine.getObject(objectName)[methodName](...args)
    }

    public getRelativePath(filename: string) {
        return pathJoin('DANE', this.definition.PATH, filename)
    }
}

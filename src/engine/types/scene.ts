import {Type} from './index'
import {SceneDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError, pathJoin} from '../../utils'
import {Behaviour} from './behaviour'

export class Scene extends Type<SceneDefinition> {
    constructor(engine: Engine, definition: SceneDefinition) {
        super(engine, definition)
    }

    getRelativePath(filename: string) {
        return pathJoin('DANE', this.definition.PATH, filename)
    }

    // I don't think that it does anything
    SETMUSICVOLUME(volume: number) {
        throw new NotImplementedError()
    }

    SETMINHSPRIORITY(arg: number) {
        throw new NotImplementedError()
    }

    RUNCLONES(baseObjectName: string, arg1: any, arg2: any, behaviourName: string) {
        const baseObject: Type<any> = this.engine.getObject(baseObjectName)
        const behaviour: Behaviour = this.engine.getObject(behaviourName)
        for (const clone of baseObject.clones) {
            behaviour.RUN(clone)
        }
    }

    RUN(objectName: string, methodName: string, ...args: any[]) {
        return this.engine.getObject(objectName)[methodName](...args)
    }
}

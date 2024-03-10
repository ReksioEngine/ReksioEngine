import {Type} from './index'
import {SceneDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError, pathJoin} from '../../utils'

export class Scene extends Type<SceneDefinition> {
    constructor(engine: Engine, definition: SceneDefinition) {
        super(engine, definition)
    }

    getRelativePath(filename: string) {
        return pathJoin('DANE', this.definition.PATH, filename)
    }

    SETMUSICVOLUME(volume: number) {
        // I don't think that it does anything
    }

    SETMINHSPRIORITY(arg: number) {
        throw new NotImplementedError()
    }

    RUNCLONES(baseObjectName: string, arg1: any, arg2: any, behaviourName: string) {
        throw new NotImplementedError()
    }

    RUN(objectName: string, methodName: string) {
        throw new NotImplementedError()
    }
}

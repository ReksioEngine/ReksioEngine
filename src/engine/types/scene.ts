import { Type } from './index'
import { SceneDefinition } from '../../fileFormats/cnv/types'
import { pathJoin } from '../../utils'
import { Behaviour } from './behaviour'
import { assert, NotImplementedError } from '../../errors'
import { method } from '../../types'

export class Scene extends Type<SceneDefinition> {
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
    RUNCLONES(baseObjectName: string, startingIdx: number, endingIdx: number, behaviourName: string) {
        const baseObject: Type<any> = this.engine.getObject(baseObjectName)
        const behaviour: Behaviour = this.engine.getObject(behaviourName)

        if (startingIdx < 1) {
            startingIdx = 1
        }
        if (endingIdx <= 0) {
            endingIdx = baseObject.clones.length
        }

        for (let i = startingIdx - 1; i <= endingIdx - 1; i++) {
            const clone = baseObject.clones[i]
            behaviour.RUN(clone)
        }
    }

    @method()
    RUN(objectName: string, methodName: string, ...args: any[]) {
        const object = this.engine.getObject(objectName)
        if (object === null) {
            return
        }

        const method = object[methodName]
        if (method !== undefined) {
            return method.bind(object)(...args)
        } else {
            return object.__call(methodName, args)
        }
    }

    public getRelativePath(filename: string) {
        return pathJoin('DANE', this.definition.PATH, filename)
    }
}

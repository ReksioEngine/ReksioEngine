import { ParentType, Type } from './index'
import { SceneDefinition } from '../../fileFormats/cnv/types'
import { Behaviour } from './behaviour'
import { assert, NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'
import { loadSound } from '../../filesystem/assetsLoader'
import { pathJoin } from '../../filesystem'

export class Scene extends ParentType<SceneDefinition> {
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
    async RUNCLONES(baseObjectName: string, startingIdx: number, endingIdx: number, behaviourName: string) {
        const baseObject: Type<any> | null = this.getObject(baseObjectName)
        const behaviour: Behaviour | null = this.getObject(behaviourName)
        assert(baseObject !== null && behaviour !== null)

        if (startingIdx < 1) {
            startingIdx = 1
        }
        if (endingIdx <= 0) {
            endingIdx = baseObject.clones.length
        }

        for (let i = startingIdx - 1; i <= endingIdx - 1; i++) {
            const clone = baseObject.clones[i]
            await behaviour.RUN(clone)
        }
    }

    @method()
    async RUN(objectName: string, methodName: string, ...args: any[]) {
        const object: any = this.getObject(objectName)
        if (object === null) {
            return
        }

        const method = object[methodName]
        if (method !== undefined) {
            return await method.bind(object)(...args)
        } else {
            return await object.__call(methodName, args)
        }
    }

    @method()
    async STARTMUSIC(filename: string) {
        this.engine.music?.stop()
        this.engine.music = await loadSound(this.engine.filesystem, filename, {
            loop: true,
        })
        await this.engine.music.play()
    }

    @method()
    GETMAXHSPRIORITY() {
        throw new NotImplementedError()
    }

    @method()
    GETMINHSPRIORITY() {
        throw new NotImplementedError()
    }

    @method()
    GETPLAYINGANIMO(arg: number) {
        throw new NotImplementedError()
    }

    public getRelativePath(filename: string) {
        const scenePath = pathJoin('DANE', this.definition.PATH)
        return this.engine.resolvePath(filename, scenePath)
    }
}

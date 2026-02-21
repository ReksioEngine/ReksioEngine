import { Type } from './index'
import { WorldDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'
import { NotImplementedError } from '../../common/errors'

export class World extends Type<WorldDefinition> {
    @method()
    LOAD(filename: string) {
        throw new NotImplementedError()
    }

    @method()
    SETGRAVITY(x: number, y: number, z: number) {
        throw new NotImplementedError()
    }

    @method()
    ADDBODY(id: number, density: number, mu: number, friction: number, bounce: number, bounceVel: number, maxVel: number, bodyType: number, geomType: number) {
        throw new NotImplementedError()
    }

    @method()
    SETLIMIT(id: number, x: number, y: number, z: number, x1: number, y1: number, z1: number) {
        throw new NotImplementedError()
    }

    @method()
    SETSPEED(id: number, speed: number) {
        throw new NotImplementedError()
    }

    @method()
    LINK(id: number, animoName: string, flag?: any) {
        throw new NotImplementedError()
    }

    @method()
    SETPOSITION(id: number, x: number, y: number, z: number) {
        throw new NotImplementedError()
    }

    @method()
    SETVELOCITY(id: number, x: number, y: number, z: number) {
        throw new NotImplementedError()
    }

    @method()
    SETMAXSPEED(id: number, speed: number) {
        throw new NotImplementedError()
    }

    @method()
    MOVEOBJECTS() {
        throw new NotImplementedError()
    }
}
import { Type } from './index'
import { WorldDefinition } from '../../fileFormats/cnv/types'
import { method, int, double } from '../../common/types'
import { NotImplementedError } from '../../common/errors'

export class World extends Type<WorldDefinition> {
    @method()
    LOAD(filename: string) {
        throw new NotImplementedError()
    }

    @method()
    SETGRAVITY(x: double, y: double, z: double) {
        throw new NotImplementedError()
    }

    @method()
    ADDBODY(
        id: int,
        density: double,
        mu: double,
        friction: double,
        bounce: double,
        bounceVel: double,
        maxVel: double,
        bodyType: int,
        geomType: int
    ) {
        throw new NotImplementedError()
    }

    @method()
    SETLIMIT(id: int, x: double, y: double, z: double, x1: double, y1: double, z1: double) {
        throw new NotImplementedError()
    }

    @method()
    SETSPEED(id: int, speed: double) {
        throw new NotImplementedError()
    }

    @method()
    LINK(id: int, animoName: string, flag?: any) {
        throw new NotImplementedError()
    }

    @method()
    SETPOSITION(id: int, x: double, y: double, z: double) {
        throw new NotImplementedError()
    }

    @method()
    SETVELOCITY(id: int, x: double, y: double, z: double) {
        throw new NotImplementedError()
    }

    @method()
    SETMAXSPEED(id: int, speed: double) {
        throw new NotImplementedError()
    }

    @method()
    MOVEOBJECTS() {
        throw new NotImplementedError()
    }
}

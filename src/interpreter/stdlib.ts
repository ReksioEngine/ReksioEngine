import {Engine} from '../engine'
import {ArrayObject} from '../engine/types/array'
import {ForceNumber} from '../types'

class Library {
    protected readonly engine?: Engine
    constructor(engine?: Engine) {
        this.engine = engine
    }
}

export class RandomLibrary extends Library{
    GET(min: number | string, max?: number | string): number {
        // Min and Max can be a string containing a number.
        // Probably behaviour's constant arguments can only be a string
        min = ForceNumber(min)

        if (max === undefined) {
            return this.GET(0, min)
        }

        max = ForceNumber(max)
        return Math.floor(Math.random() * (max - min)) + min
    }

    GETPLENTY(objectTarget: string, count: number | string, min: number | string, max: number | string, arg5: boolean) {
        count = ForceNumber(count)
        min = ForceNumber(min)
        max = ForceNumber(max)

        const object = this.engine?.getObject(objectTarget) as ArrayObject

        const values = []
        for (let i = 0; i < count; i++) {
            values.push(this.GET(min, max))
        }
        object.ADD(...values)
    }
}
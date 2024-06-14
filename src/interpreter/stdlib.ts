import {Engine} from '../engine'
import {ArrayObject} from '../engine/types/array'

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
        min = Number(min)
        max = Number(max)

        if (max === undefined) {
            return this.GET(0, min)
        }

        return Math.floor(Math.random() * (max - min)) + min
    }

    GETPLENTY(objectTarget: string, count: number | string, min: number | string, max: number | string, arg5: boolean) {
        count = Number(count)
        min = Number(min)
        max = Number(max)

        const object = this.engine?.getObject(objectTarget) as ArrayObject
        object.ADD([...Array(count)].map(_ => this.GET(min, max)))
    }
}
import { Engine } from '../../engine'
import { ArrayObject } from '../../engine/types/array'
import { method } from '../../types'

class Library {
    protected readonly engine?: Engine
    constructor(engine?: Engine) {
        this.engine = engine
    }
}

export class RandomLibrary extends Library {
    @method()
    GET(min: number, max?: number): number {
        if (max === undefined) {
            return this.GET(0, min)
        }

        max = min + max
        return Math.floor(Math.random() * (max - min)) + min
    }

    @method()
    GETPLENTY(objectTarget: string, count: number, min: number, max: number, unique: boolean) {
        const object = this.engine?.getObject(objectTarget) as ArrayObject

        const values: number[] = []
        while (values.length < count) {
            const randomValue = this.GET(min, max)
            if (!unique || !values.includes(randomValue)) {
                values.push(randomValue)
            }
        }

        object.ADD(...values)
    }
}

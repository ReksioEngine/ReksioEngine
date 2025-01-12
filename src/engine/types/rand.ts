import { Type } from './index'
import { RandDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../types'
import { ArrayObject } from './array'

export class Rand extends Type<RandDefinition> {
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

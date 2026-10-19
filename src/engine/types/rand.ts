import { Type } from './index'
import { RandDefinition } from '../../fileFormats/cnv/types'
import { method, int } from '../../common/types'
import { ArrayObject } from './array'
import { assert } from '../../common/errors'
import { createInteger } from './values'

export class Rand extends Type<RandDefinition> {
    @method()
    GET(min: int, max?: int): int {
        return this.random(min, max)
    }

    private random(min: number, max?: number): number {
        if (max === undefined) {
            return this.random(0, min)
        }

        max = min + max
        return Math.floor(Math.random() * (max - min)) + min
    }

    @method()
    GETPLENTY(objectTarget: string, count: int, min: int, max: int, unique: boolean) {
        const object = this.getObject<ArrayObject>(objectTarget)
        assert(object !== null)

        const values: number[] = []
        while (values.length < count) {
            const randomValue = this.random(min, max)
            if (!unique || !values.includes(randomValue)) {
                values.push(randomValue)
            }
        }

        object.push(...values.map((value) => createInteger(this.engine, value)))
    }
}

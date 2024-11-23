import { ValueType } from './index'
import { MultiArrayDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert } from '../../errors'
import { method } from '../../types'

export class MultiArray extends ValueType<MultiArrayDefinition> {
    constructor(engine: Engine, definition: MultiArrayDefinition) {
        super(engine, definition, [])
    }

    init() {
        assert(
            this.definition.DIMENSIONS === 2,
            'Piklib supports only 2 dimensions. Other number of dimensions causes unexpected behavior'
        )
    }

    @method()
    SET(y: number, x: number, value: any) {
        while (y >= this.value.length) {
            this.value.push([])
        }
        while (x >= this.value[y].length) {
            this.value[y].push(null)
        }
        this.value[y][x] = value
    }

    @method()
    GET(y: number, x: number) {
        if (y < this.value.length && x < this.value[y].length) {
            return this.value[y][x]
        }
        return null
    }
}

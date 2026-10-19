import { ParentType, ValueType } from './index'
import { MultiArrayDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert } from '../../common/errors'
import { method, int } from '../../common/types'
import { copyValue, ScalarValue, rawValue, Value } from './values'

export class MultiArray extends ValueType<MultiArrayDefinition, (ScalarValue | null)[][]> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: MultiArrayDefinition) {
        super(engine, parent, definition, [])
    }

    init() {
        assert(
            this.definition.DIMENSIONS === 2,
            'Piklib supports only 2 dimensions. Other number of dimensions causes unexpected behavior'
        )
    }

    @method()
    async SET(y: int, x: int, value: Value) {
        assert(x >= 0 && y >= 0, "MULTIARRAY indexes can't be negative")

        while (this.value.length <= y) {
            this.value.push([])
        }

        const row = this.value[y]
        while (row.length < x) {
            row.push(null)
        }
        row[x] = await copyValue(this.engine, value)
    }

    @method()
    GET(y: int, x: int) {
        if (y >= 0 && y < this.value.length && x >= 0 && x < this.value[y].length) {
            return copyValue(this.engine, this.value[y][x])
        }
        return null
    }

    getValue(): (ScalarValue | null)[][] {
        return this.value
    }

    protected serialize(): string {
        return this.value.map((row) => row.map(rawValue)).toString()
    }
}

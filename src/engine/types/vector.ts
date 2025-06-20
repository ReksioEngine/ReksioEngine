import { Type, ValueType } from './index'
import { VectorDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert } from '../../common/errors'
import { method } from '../../common/types'

export class Vector extends ValueType<VectorDefinition> {
    constructor(engine: Engine, parent: Type<any> | null, definition: VectorDefinition) {
        super(engine, parent, definition)
        this.value = this.definition.VALUE
    }

    @method()
    ASSIGN(...values: number[]) {
        const newValue = this.value
        for (let i = 0; i < values.length; i++) {
            newValue[i] = values[i]
        }
        this.value = newValue
    }

    @method()
    ADD(otherVector: number[]) {
        this.value = this.value.map((val: number, idx: number) => val + otherVector[idx])
    }

    @method()
    MUL(scalar: number) {
        this.value = this.value.map((val: number) => val * scalar)
    }

    @method()
    GET(index: number) {
        return this.value[index]
    }

    @method()
    NORMALIZE() {
        const magnitude = this.LEN()
        assert(magnitude !== 0, 'Cannot normalize a zero vector')
        this.value = this.value.map((val: number) => val / magnitude)
    }

    // any[] to prevent typeGuard creating new array
    // result param is a reference
    @method()
    REFLECT(normal: number[], result: any[]): void {
        // Calculate the dot product between this.value and the normal vector
        let dotProduct = 0
        for (let i = 0; i < this.value.length; i++) {
            dotProduct += this.value[i] * normal[i]
        }

        // Perform the reflection calculation for each dimension
        for (let i = 0; i < this.value.length; i++) {
            result[i] = 2 * dotProduct * normal[i] - this.value[i]
        }
    }

    @method()
    LEN(): number {
        return Math.sqrt(this.value.reduce((sum: number, val: number) => sum + val * val, 0))
    }
}

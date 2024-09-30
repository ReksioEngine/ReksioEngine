import {ValueType} from './index'
import {VectorDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {assert} from '../../errors'

export class Vector extends ValueType<VectorDefinition> {
    constructor(engine: Engine, definition: VectorDefinition) {
        super(engine, definition)
        this.value = this.definition.VALUE
    }

    ASSIGN(...values: number[]) {
        this.value = values
    }

    ADD(otherVector: number[]) {
        this.value = this.value.map((val: number, idx: number) => val + otherVector[idx])
    }

    MUL(scalar: number) {
        this.value = this.value.map((val: number) => val * scalar)
    }

    GET(index: number) {
        return this.value[index]
    }

    NORMALIZE() {
        const magnitude: number = Math.sqrt(this.value.reduce((sum: number, val: number) => sum + val * val, 0))
        assert(magnitude !== 0, 'Cannot normalize a zero vector')

        this.value = this.value.map((val: number) => val / magnitude)
    }

    REFLECT(vector: number[], normal: number[]): void {
        assert(
            this.value.length === normal.length && this.value.length === vector.length,
            'Vector and normal must have the same dimensionality'
        )

        // Calculate the dot product of the vector and the normal vector
        const dotProduct: number = vector.reduce((sum: number, val: number, idx: number) => sum + val * normal[idx], 0)

        // Calculate the reflection: v - 2 * (v . n) * n
        this.value = vector.map((val: number, idx: number) =>
            val - 2 * dotProduct * normal[idx]
        )
    }
}

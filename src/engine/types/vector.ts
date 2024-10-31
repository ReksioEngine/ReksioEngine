import {ValueType} from './index'
import {VectorDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {assert} from '../../errors'
import {ForceNumber} from '../../types'

export class Vector extends ValueType<VectorDefinition> {
    constructor(engine: Engine, definition: VectorDefinition) {
        super(engine, definition)
        this.value = this.definition.VALUE
    }

    ASSIGN(...values: number[]) {
        const newValue = this.value
        for (let i = 0; i < values.length; i++) {
            newValue[i] = ForceNumber(values[i])
        }
        this.value = newValue
    }

    ADD(otherVector: number[]) {
        otherVector = otherVector.map(e => ForceNumber(e))
        this.value = this.value.map((val: number, idx: number) => val + otherVector[idx])
    }

    MUL(scalar: number) {
        scalar = ForceNumber(scalar)
        this.value = this.value.map((val: number) => val * scalar)
    }

    GET(index: number) {
        return this.value[ForceNumber(index)]
    }

    NORMALIZE() {
        const magnitude = this.LEN()
        assert(magnitude !== 0, 'Cannot normalize a zero vector')
        this.value = this.value.map((val: number) => val / magnitude)
    }

    REFLECT(normal: number[], result: number[]): void {
        normal = normal.map(e => ForceNumber(e))

        // Calculate the dot product between this.value and the normal vector
        let dotProduct = 0
        for (let i = 0; i < this.value.length; i++) {
            dotProduct += this.value[i] * normal[i]
        }

        // Perform the reflection calculation for each dimension
        for (let i = 0; i < this.value.length; i++) {
            result[i] = this.value[i] - 2 * dotProduct * normal[i]
        }
    }

    LEN(): number {
        return Math.sqrt(this.value.reduce((sum: number, val: number) => sum + val * val, 0))
    }
}

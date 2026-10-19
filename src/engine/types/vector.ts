import { ParentType, ValueType } from './index'
import { VectorDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert } from '../../common/errors'
import { method, double, int } from '../../common/types'

export class Vector extends ValueType<VectorDefinition, number[]> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: VectorDefinition) {
        super(engine, parent, definition, [])
        this.value = this.definition.VALUE
    }

    @method()
    async ASSIGN(...values: double[]) {
        const newValue = this.value
        for (let i = 0; i < values.length; i++) {
            newValue[i] = values[i]
        }
        await this.setValue(newValue)
    }

    @method()
    async ADD(otherVector: Vector) {
        const other = otherVector.getValue()
        await this.setValue(this.value.map((val: number, idx: number) => val + other[idx]))
    }

    @method()
    async MUL(scalar: double) {
        await this.setValue(this.value.map((val: number) => val * scalar))
    }

    @method()
    GET(index: int): double {
        return this.value[index]
    }

    @method()
    async NORMALIZE() {
        const magnitude = this.length()
        assert(magnitude !== 0, 'Cannot normalize a zero vector')
        await this.setValue(this.value.map((val: number) => val / magnitude))
    }

    // The reflection is written into the result vector
    @method()
    async REFLECT(normalVector: Vector, result: Vector): Promise<void> {
        const normal = normalVector.getValue()

        // Calculate the dot product between this.value and the normal vector
        let dotProduct = 0
        for (let i = 0; i < this.value.length; i++) {
            dotProduct += this.value[i] * normal[i]
        }

        // Perform the reflection calculation for each dimension
        const reflection = [...result.getValue()]
        for (let i = 0; i < this.value.length; i++) {
            reflection[i] = 2 * dotProduct * normal[i] - this.value[i]
        }
        await result.setValue(reflection)
    }

    @method()
    LEN(): double {
        return this.length()
    }

    getValue(): number[] {
        return this.value
    }

    private length(): number {
        return Math.sqrt(this.value.reduce((sum: number, val: number) => sum + val * val, 0))
    }
}

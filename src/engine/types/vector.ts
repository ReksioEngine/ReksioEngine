import {ValueType} from './index'
import {VectorDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'

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
}

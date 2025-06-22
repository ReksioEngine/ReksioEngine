import { Type, ValueType } from './index'
import { Engine } from '../index'
import { DoubleDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'

const radianMultiplier = Math.PI / 180

export class Double extends ValueType<DoubleDefinition> {
    constructor(engine: Engine, parent: Type<any> | null, definition: DoubleDefinition) {
        super(engine, parent, definition, 0.0)
    }

    @method()
    MUL(value: number) {
        return (this.value *= value)
    }

    @method()
    ADD(value: number) {
        return (this.value += value)
    }

    @method()
    SUB(value: number) {
        return (this.value -= value)
    }

    @method()
    SET(newValue: number) {
        this.value = newValue
    }

    @method()
    MAXA(...values: number[]) {
        return (this.value = Math.max(...values))
    }

    @method()
    MINA(...values: number[]) {
        return (this.value = Math.min(...values))
    }

    @method()
    SINUS(angle: number) {
        return (this.value = Math.sin(angle * radianMultiplier))
    }

    @method()
    COSINUS(angle: number) {
        return (this.value = Math.cos(angle * radianMultiplier))
    }

    // Source: https://docs.google.com/spreadsheets/d/1SYI_Gu6MAuSGw-OTXzk_FDWScx29Cc-6eXpc6UfSn1Y/edit?gid=1909841994#gid=1909841994
    @method()
    ARCTANEX(y: number, x: number, summand?: number) {
        let value = Math.atan2(y, x) / radianMultiplier

        if (value < 0) {
            value += 360
        }

        if (summand !== undefined) {
            value = Math.floor(value) + summand
        }

        this.value = value
        return this.value
    }

    @method()
    GET() {
        return this.value
    }
}

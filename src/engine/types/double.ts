import {ValueType} from './index'
import {Engine} from '../index'
import {DoubleDefinition} from '../../fileFormats/cnv/types'

export class Double extends ValueType<DoubleDefinition> {
    constructor(engine: Engine, definition: DoubleDefinition) {
        super(engine, definition, 0.0)
    }

    MUL(value: number | string) {
        this.value *= Number(value)
        return this.value
    }

    ADD(value: number | string) {
        this.value += Number(value)
        return this.value
    }

    SET(newValue: number | string) {
        this.value = Number(newValue)
    }

    SINUS(angle: number | string) {
        this.value = Math.sin(Number(angle))
        return this.value
    }

    COSINUS(angle: number | string) {
        this.value = Math.cos(Number(angle))
        return this.value
    }

    // Source: https://docs.google.com/spreadsheets/d/1SYI_Gu6MAuSGw-OTXzk_FDWScx29Cc-6eXpc6UfSn1Y/edit?gid=1909841994#gid=1909841994
    ARCTANEX(y: number | string, x: number | string, summand?: number | string) {
        let newValue = Math.atan2(Number(y), Number(x))
        if (summand !== undefined) {
            newValue = Math.floor(newValue) + Number(summand)
        }
        this.value = newValue
        return this.value
    }

    GET() {
        return this.value
    }
}

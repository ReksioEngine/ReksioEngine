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
    async MUL(value: number) {
        return await this.setValue(this.value * value)
    }

    @method()
    async ADD(value: number) {
        return await this.setValue(this.value + value)
    }

    @method()
    async SUB(value: number) {
        return await this.setValue(this.value - value)
    }

    @method()
    async SET(newValue: number) {
        await this.setValue(newValue)
    }

    @method()
    async MAXA(...values: number[]) {
        return await this.setValue(Math.max(...values))
    }

    @method()
    async MINA(...values: number[]) {
        return await this.setValue(Math.min(...values))
    }

    @method()
    async SINUS(angle: number) {
        return await this.setValue(Math.sin(angle * radianMultiplier))
    }

    @method()
    async COSINUS(angle: number) {
        return await this.setValue(Math.cos(angle * radianMultiplier))
    }

    // Source: https://docs.google.com/spreadsheets/d/1SYI_Gu6MAuSGw-OTXzk_FDWScx29Cc-6eXpc6UfSn1Y/edit?gid=1909841994#gid=1909841994
    @method()
    async ARCTANEX(y: number, x: number, summand?: number) {
        let value = Math.atan2(y, x) / radianMultiplier

        if (value < 0) {
            value += 360
        }

        if (summand !== undefined) {
            value = Math.floor(value) + summand
        }

        return await this.setValue(value)
    }

    @method()
    GET() {
        return this.value
    }
}

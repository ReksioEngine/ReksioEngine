import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { DoubleDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'

const radianMultiplier = Math.PI / 180

export class Double extends ValueType<DoubleDefinition, number> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: DoubleDefinition) {
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
    async DIV(value: number) {
        return await this.setValue(this.value / value)
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
    async LENGTH(pointX: number, pointY: number) {
        return await this.setValue(Math.sqrt(pointX * pointX + pointY * pointY))
    }

    @method()
    GET() {
        return this.value
    }

    public async toString(): Promise<string> {
        const value = this.value as number
        const abs = Math.abs(value)

        // Use fixed‑point for numbers below 1e21, otherwise fallback to bigint representation
        const fixed = abs < 1e21 ? abs.toFixed(5) : `${BigInt(abs)}.00000`
        const sign = value < 0 ? '-' : ''

        // Values with absolute magnitude >= 1
        if (!fixed.startsWith('0.')) {
            return sign + fixed
        }

        // Zero value
        if (value === 0) {
            return '00000'
        }

        // Values between 0 and 1 (exclusive)
        let leadingZeros = ''
        for (let v = value; v > 0 && v * 10.0001 < 1; v *= 10) {
            leadingZeros += '0'
        }

        const digits = fixed.slice(2).replace(/^0+/, '') || '0'
        return `0.${sign}${leadingZeros}${digits}`
    }
}

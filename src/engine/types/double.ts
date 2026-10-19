import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { DoubleDefinition } from '../../fileFormats/cnv/types'
import { method, valueAsDouble, double, doubleAsString } from '../../common/types'

const radianMultiplier = Math.PI / 180

export class Double extends ValueType<DoubleDefinition, number> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: DoubleDefinition) {
        super(engine, parent, definition, 0.0)
    }

    @method()
    async MUL(value: double): Promise<double> {
        return await this.setValue(this.value * value)
    }

    @method()
    async ADD(value: double): Promise<double> {
        return await this.setValue(this.value + value)
    }

    @method()
    async SUB(value: double): Promise<double> {
        return await this.setValue(this.value - value)
    }

    @method()
    async SET(newValue: double) {
        await this.setValue(newValue)
    }

    @method()
    async DIV(value: double): Promise<double> {
        return await this.setValue(this.value / value)
    }

    @method()
    async MAXA(...values: double[]): Promise<double> {
        return await this.setValue(Math.max(...values))
    }

    @method()
    async MINA(...values: double[]): Promise<double> {
        return await this.setValue(Math.min(...values))
    }

    @method()
    async SINUS(angle: double): Promise<double> {
        return await this.setValue(Math.sin(angle * radianMultiplier))
    }

    @method()
    async COSINUS(angle: double): Promise<double> {
        return await this.setValue(Math.cos(angle * radianMultiplier))
    }

    // Source: https://docs.google.com/spreadsheets/d/1SYI_Gu6MAuSGw-OTXzk_FDWScx29Cc-6eXpc6UfSn1Y/edit?gid=1909841994#gid=1909841994
    @method()
    async ARCTANEX(y: double, x: double, summand?: double): Promise<double> {
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
    async LENGTH(x: double, y: double): Promise<double> {
        return await this.setValue(Math.sqrt(x * x + y * y))
    }

    @method()
    GET(): double {
        return this.value
    }

    getValue(): number {
        return this.value
    }

    async equals(other: ValueType<any, any>) {
        return this.getValue() === valueAsDouble(await other.getValue())
    }

    async compare(other: ValueType<any, any>) {
        return Math.sign(this.getValue() - valueAsDouble(await other.getValue()))
    }

    public async toString(): Promise<string> {
        return doubleAsString(this.value)
    }
}

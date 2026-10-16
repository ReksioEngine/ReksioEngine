import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { IntegerDefinition } from '../../fileFormats/cnv/types'
import { ForceNumber, method } from '../../common/types'

export class Integer extends ValueType<IntegerDefinition, number> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: IntegerDefinition) {
        super(engine, parent, definition, 0)
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    @method()
    async INC() {
        return this.setValue(this.value + 1)
    }

    @method()
    async DEC() {
        return this.setValue(this.value - 1)
    }

    @method()
    async ADD(value: number) {
        return this.setValue(this.value + value)
    }

    @method()
    async SUB(value: number) {
        return this.setValue(this.value - value)
    }

    @method()
    async MUL(value: number) {
        return this.setValue(this.value * value)
    }

    @method()
    async DIV(value: number) {
        return this.setValue(this.value / value)
    }

    @method()
    async MOD(value: number) {
        return this.setValue(this.value % value)
    }

    @method()
    async CLAMP(min: number, max: number) {
        return this.setValue(Math.min(max, Math.max(this.value, min)))
    }

    @method()
    async AND(value: number) {
        return this.setValue(this.value & value)
    }

    @method()
    async SET(newValue: number) {
        await this.setValue(newValue)
    }

    @method()
    async GET() {
        return this.value
    }

    @method()
    async SWITCH(first: number, second: number) {
        return this.setValue(this.value == first ? second : first)
    }

    @method()
    async ABS(value: number) {
        return this.setValue(Math.abs(value))
    }

    @method()
    async RANDOM(offset: number, range: number) {
        return Math.floor(Math.random() * range) + offset
    }

    protected async valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            await this.callbacks.run('ONCHANGED', newValue)
        }
        await this.callbacks.run('ONBRUTALCHANGED', newValue)
    }

    // Force integer truncated values
    async setValue(newValue: number) {
        return await super.setValue(Math.trunc(newValue))
    }

    public async toString(): Promise<string> {
        return this.getValue().toString()
    }
}

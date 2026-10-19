import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { IntegerDefinition } from '../../fileFormats/cnv/types'
import { method, valueAsInteger, int } from '../../common/types'

export class Integer extends ValueType<IntegerDefinition, number> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: IntegerDefinition) {
        super(engine, parent, definition, 0)
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    @method()
    async INC(): Promise<int> {
        return await this.setValue(this.value + 1)
    }

    @method()
    async DEC(): Promise<int> {
        return await this.setValue(this.value - 1)
    }

    @method()
    async ADD(value: int): Promise<int> {
        return await this.setValue(this.value + value)
    }

    @method()
    async SUB(value: int): Promise<int> {
        return await this.setValue(this.value - value)
    }

    @method()
    async MUL(value: int): Promise<int> {
        return await this.setValue(this.value * value)
    }

    @method()
    async DIV(value: int): Promise<int> {
        return await this.setValue(this.value / value)
    }

    @method()
    async MOD(value: int): Promise<int> {
        return await this.setValue(this.value % value)
    }

    @method()
    async CLAMP(min: int, max: int): Promise<int> {
        return await this.setValue(Math.min(max, Math.max(this.value, min)))
    }

    @method()
    async AND(value: int): Promise<int> {
        return await this.setValue(this.value & value)
    }

    @method()
    async SET(newValue: int) {
        await this.setValue(newValue)
    }

    @method()
    async GET(): Promise<int> {
        return this.value
    }

    @method()
    async SWITCH(first: int, second: int): Promise<int> {
        return await this.setValue(this.value === first ? second : first)
    }

    @method()
    async ABS(value: int): Promise<int> {
        return await this.setValue(Math.abs(value))
    }

    @method()
    async RANDOM(offset: int, range: int): Promise<int> {
        return Math.floor(Math.random() * range) + offset
    }

    getValue(): number {
        return this.value
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

    async equals(other: ValueType<any, any>) {
        return this.getValue() === valueAsInteger(await other.getValue())
    }

    async compare(other: ValueType<any, any>) {
        return Math.sign(this.getValue() - valueAsInteger(await other.getValue()))
    }

    public async toString(): Promise<string> {
        return this.getValue().toString()
    }
}

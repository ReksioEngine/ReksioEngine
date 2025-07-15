import { Type, ValueType } from './index'
import { Engine } from '../index'
import { IntegerDefinition } from '../../fileFormats/cnv/types'
import { ForceNumber, method } from '../../common/types'

export class Integer extends ValueType<IntegerDefinition, number> {
    constructor(engine: Engine, parent: Type<any> | null, definition: IntegerDefinition) {
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
    // TODO: Maybe type guard could try to resolve references
    async SET(newValue?: number | string) {
        if (typeof newValue == 'string') {
            const possibleInteger = this.engine.getObject(newValue)
            if (possibleInteger instanceof Integer) {
                await this.setValue(possibleInteger.value)
                return
            }
        }

        // That's how the game works
        if (newValue === undefined) {
            await this.setValue(0)
            return
        }

        await this.setValue(ForceNumber(newValue))
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

    async getValue() {
        return super.getValue()
    }

    // Force always flooring values
    async setValue(newValue: number) {
        return await super.setValue(Math.floor(newValue))
    }
}

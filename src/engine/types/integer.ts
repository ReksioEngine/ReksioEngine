import {ValueType} from './index'
import {Engine} from '../index'
import {IntegerDefinition} from '../../fileFormats/cnv/types'
import {ForceNumber, method} from '../../types'

export class Integer extends ValueType<IntegerDefinition> {
    constructor(engine: Engine, definition: IntegerDefinition) {
        super(engine, definition, 0)
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    @method()
    INC() {
        return ++this.value
    }

    @method()
    DEC() {
        return --this.value
    }

    @method()
    ADD(value: number) {
        return this.value += value
    }

    @method()
    SUB(value: number) {
        return this.value -= value
    }

    @method()
    MUL(value: number) {
        return this.value *= value
    }

    @method()
    DIV(value: number) {
        return this.value /= value
    }

    @method()
    MOD(value: number) {
        return this.value %= value
    }

    @method()
    CLAMP(min: number, max: number) {
        return this.value = Math.min(max, Math.max(this.value, min))
    }

    @method()
    AND(value: number) {
        return this.value &= value
    }

    @method()
    // TODO: Maybe type guard could try to resolve references
    SET(newValue?: number | string) {
        if (typeof newValue == 'string') {
            const possibleInteger = this.engine.getObject(newValue)
            if (possibleInteger instanceof Integer) {
                this.value = possibleInteger.value
                return
            }
        }

        // That's how the game works
        if (newValue === undefined) {
            this.value = 0
            return
        }

        this.value = ForceNumber(newValue)
    }

    @method()
    GET() {
        return this.value
    }

    @method()
    SWITCH(first: number, second: number) {
        return this.value = this.value == first ? second : first
    }

    @method()
    ABS(value: number) {
        return this.value = Math.abs(value)
    }

    protected valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            this.callbacks.run('ONCHANGED', newValue)
        }
        this.callbacks.run('ONBRUTALCHANGED', newValue)
    }

    get value() {
        return super.value
    }

    // Force always flooring values
    set value(newValue: any) {
        super.value = Math.floor(newValue)
    }
}

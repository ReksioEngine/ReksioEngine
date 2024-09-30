import {ValueType} from './index'
import {Engine} from '../index'
import {IntegerDefinition} from '../../fileFormats/cnv/types'
import {ForceNumber} from '../../types'

export class Integer extends ValueType<IntegerDefinition> {
    constructor(engine: Engine, definition: IntegerDefinition) {
        super(engine, definition, 0)
        this.callbacks.register('ONINIT', this.definition.ONINIT)
        this.callbacks.registerGroup('ONCHANGED', this.definition.ONCHANGED)
        this.callbacks.registerGroup('ONBRUTALCHANGED', this.definition.ONBRUTALCHANGED)
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    INC() {
        this.value++
        return this.value
    }

    DEC() {
        this.value--
        return this.value
    }

    ADD(value: number | string) {
        this.value += ForceNumber(value)
        return this.value
    }

    SUB(value: number | string) {
        this.value -= ForceNumber(value)
        return this.value
    }

    MUL(value: number | string) {
        this.value *= ForceNumber(value)
        return this.value
    }

    DIV(value: number | string) {
        this.value /= ForceNumber(value)
        return this.value
    }

    MOD(value: number) {
        this.value %= ForceNumber(value)
        return this.value
    }

    CLAMP(min: number | string, max: number | string) {
        this.value = Math.min(ForceNumber(max), Math.max(this.value, ForceNumber(min)))
        return this.value
    }

    AND(value: number | string) {
        this.value &= ForceNumber(value)
        return this.value
    }

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

    GET() {
        return this.value
    }

    SWITCH(first: string | number, second: string | number) {
        if (this.value == ForceNumber(first)) {
            this.value = ForceNumber(second)
        } else {
            this.value = ForceNumber(first)
        }
        return this.value
    }

    ABS(value: number | string) {
        this.value = Math.abs(ForceNumber(value))
        return this.value
    }

    valueChanged(oldValue: any, newValue: any) {
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

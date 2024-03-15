import {ValueType} from './index'
import {Engine} from '../index'
import {IntegerDefinition} from '../../fileFormats/cnv/types'

export class Integer extends ValueType<IntegerDefinition> {
    constructor(engine: Engine, definition: IntegerDefinition) {
        super(engine, definition, 0)
        this.callbacks.registerGroup('ONCHANGED', this.definition.ONCHANGED)
        this.callbacks.registerGroup('ONBRUTALCHANGED', this.definition.ONBRUTALCHANGED)
    }

    INC() {
        this.value++
    }

    DEC() {
        this.value--
    }

    ADD(value: number) {
        this.value += value
    }

    SUB(value: number) {
        this.value -= value
    }

    MUL(value: number) {
        this.value *= value
    }

    DIV(value: number) {
        this.value /= value
    }

    MOD(value: number) {
        this.value %= value
    }

    CLAMP(min: number, max: number) {
        this.value = Math.min(max, Math.max(this.value, min))
    }

    AND(value: number) {
        this.value &= value
    }

    SET(newValue: number) {
        this.value = newValue
    }

    GET() {
        return this.value
    }

    valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            this.callbacks.run('ONCHANGED', newValue)
        }
        this.callbacks.run('ONBRUTALCHANGED', newValue)
    }
}

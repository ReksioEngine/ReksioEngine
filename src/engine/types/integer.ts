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

    ADD(value: number | string) {
        this.value += Number(value)
    }

    SUB(value: number | string) {
        this.value -= Number(value)
    }

    MUL(value: number | string) {
        this.value *= Number(value)
    }

    DIV(value: number | string) {
        this.value /= Number(value)
    }

    MOD(value: number) {
        this.value %= Number(value)
    }

    CLAMP(min: number | string, max: number | string) {
        this.value = Math.min(Number(max), Math.max(this.value, Number(min)))
    }

    AND(value: number | string) {
        this.value &= Number(value)
    }

    SET(newValue: number | string) {
        if (typeof newValue == 'string') {
            const possibleInteger = this.engine.getObject(newValue)
            if (possibleInteger instanceof Integer) {
                this.value = possibleInteger.value
                return
            }
        }

        this.value = Number(newValue)
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

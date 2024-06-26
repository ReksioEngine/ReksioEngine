import {ValueType} from './index'
import {Engine} from '../index'
import {IntegerDefinition} from '../../fileFormats/cnv/types'
import {ForceNumber} from '../../types'

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
        this.value += ForceNumber(value)
    }

    SUB(value: number | string) {
        this.value -= ForceNumber(value)
    }

    MUL(value: number | string) {
        this.value *= ForceNumber(value)
    }

    DIV(value: number | string) {
        this.value /= ForceNumber(value)
    }

    MOD(value: number) {
        this.value %= ForceNumber(value)
    }

    CLAMP(min: number | string, max: number | string) {
        this.value = Math.min(ForceNumber(max), Math.max(this.value, ForceNumber(min)))
    }

    AND(value: number | string) {
        this.value &= ForceNumber(value)
    }

    SET(newValue: number | string) {
        if (typeof newValue == 'string') {
            const possibleInteger = this.engine.getObject(newValue)
            if (possibleInteger instanceof Integer) {
                this.value = possibleInteger.value
                return
            }
        }

        this.value = ForceNumber(newValue)
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

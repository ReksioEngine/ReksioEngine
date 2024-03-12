import {Type} from './index'
import {Engine} from '../index'
import {IntegerDefinition} from '../../fileFormats/cnv/types'

export class Integer extends Type<IntegerDefinition> {
    constructor(engine: Engine, definition: IntegerDefinition) {
        super(engine, definition)
        this.value = this.definition.VALUE ?? 0
        this.callbacks.registerGroup('ONCHANGED', this.definition.ONCHANGED)
    }

    init() {
        this.loadFromINI()
        this.saveToINI()
    }

    INC() {
        this.value++
        this.ONCHANGED()
    }

    DEC() {
        this.value--
        this.ONCHANGED()
    }

    ADD(value: number) {
        this.value += value
        this.ONCHANGED()
    }

    SUB(value: number) {
        this.value -= value
        this.ONCHANGED()
    }

    MUL(value: number) {
        this.value *= value
        this.ONCHANGED()
    }

    DIV(value: number) {
        this.value /= value
        this.ONCHANGED()
    }

    MOD(value: number) {
        this.value %= value
        this.ONCHANGED()
    }

    CLAMP(min: number, max: number) {
        this.value = Math.min(max, Math.max(this.value, min))
        this.ONCHANGED()
    }

    AND(value: number) {
        this.value &= value
        this.ONCHANGED()
    }

    SET(newValue: number) {
        this.value = newValue
        this.ONCHANGED()
    }

    GET() {
        return this.value
    }

    private ONCHANGED() {
        this.callbacks.run('ONCHANGED', this.value)
        this.saveToINI()
    }
}

import {Type} from './index'
import {Engine} from '../index'
import {callbacks, IntegerDefinition} from '../../fileFormats/cnv/types'

export class Integer extends Type<IntegerDefinition> {
    private readonly onChanged: callbacks<number>

    constructor(engine: Engine, definition: IntegerDefinition) {
        super(engine, definition)
        this.value = this.definition.VALUE ?? 0
        this.onChanged = this.definition.ONCHANGED
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

    SET(newValue: number) {
        this.value = newValue
        this.ONCHANGED()
    }

    private ONCHANGED() {
        if (this.onChanged) {
            if (this.onChanged.nonParametrized) {
                this.engine.executeCallback(this, this.onChanged.nonParametrized)
            }
            if (this.onChanged.parametrized.has(this.value)) {
                this.engine.executeCallback(this, this.onChanged.parametrized.get(this.value)!)
            }
        }
        this.saveToINI()
    }
}

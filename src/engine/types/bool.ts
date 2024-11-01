import {ValueType} from './index'
import {Engine} from '../index'
import {BoolDefinition} from '../../fileFormats/cnv/types'

export class Bool extends ValueType<BoolDefinition> {
    constructor(engine: Engine, definition: BoolDefinition) {
        super(engine, definition, false)

        this.callbacks.registerGroup('ONCHANGED', this.definition.ONCHANGED)
        this.callbacks.registerGroup('ONBRUTALCHANGED', this.definition.ONBRUTALCHANGED)
    }

    // The arguments don't seem to matter
    SWITCH(arg1: boolean, arg2:  boolean) {
        this.value = !this.value
    }

    SET(newValue: boolean) {
        this.value = newValue
    }

    protected valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            this.callbacks.run('ONCHANGED', newValue)
        }
        this.callbacks.run('ONBRUTALCHANGED', newValue)
    }
}

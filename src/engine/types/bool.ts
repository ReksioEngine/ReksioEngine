import {Type} from './index'
import {Engine} from '../index'
import {BoolDefinition} from '../../fileFormats/cnv/types'

export class Bool extends Type<BoolDefinition> {
    private value: boolean

    constructor(engine: Engine, definition: BoolDefinition) {
        super(engine, definition)
        this.value = definition.VALUE
    }

    // The arguments don't seem to matter
    SWITCH(arg1: boolean, arg2:  boolean) {
        this.value = !this.value
    }

    SET(newValue: boolean) {
        this.value = newValue
    }
}

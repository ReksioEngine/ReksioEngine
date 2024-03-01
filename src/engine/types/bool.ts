import {Type} from './index'
import {Engine} from '../index'
import {BoolDefinition} from '../../fileFormats/cnv/types'

export class Bool extends Type<BoolDefinition> {
    private value: boolean

    constructor(engine: Engine, definition: BoolDefinition) {
        super(engine, definition)
        this.value = definition.VALUE
    }

    SWITCH(from: boolean, to:  boolean) {
        if (this.value === from) {
            this.value = to
        }
    }

    SET(newValue: boolean) {
        this.value = newValue
    }
}

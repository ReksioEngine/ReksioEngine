import {Type} from './index'
import {Engine} from '../index'
import {BoolDefinition} from '../../fileFormats/cnv/types'

export class Bool extends Type<BoolDefinition> {
    constructor(engine: Engine, definition: BoolDefinition) {
        super(engine, definition)
        this.value = definition.VALUE ?? false
    }

    init() {
        this.loadFromINI()
        this.saveToINI()
    }

    // The arguments don't seem to matter
    SWITCH(arg1: boolean, arg2:  boolean) {
        this.value = !this.value
        this.ONCHANGED()
    }

    SET(newValue: boolean) {
        this.value = newValue
        this.ONCHANGED()
    }

    private ONCHANGED() {
        this.saveToINI()
    }
}

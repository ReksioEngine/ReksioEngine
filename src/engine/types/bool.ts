import { Type, ValueType } from './index'
import { Engine } from '../index'
import { BoolDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'

export class Bool extends ValueType<BoolDefinition> {
    constructor(engine: Engine, parent: Type<any> | null, definition: BoolDefinition) {
        super(engine, parent, definition, false)
    }

    @method()
    // The arguments don't seem to matter
    SWITCH(arg1: boolean, arg2: boolean) {
        this.value = !this.value
    }

    @method()
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

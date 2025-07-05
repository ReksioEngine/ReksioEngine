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
    async SWITCH(arg1: boolean, arg2: boolean) {
        await this.setValue(!this.value)
    }

    @method()
    async SET(newValue: boolean) {
        await this.setValue(newValue)
    }

    protected async valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            await this.callbacks.run('ONCHANGED', newValue)
        }
        await this.callbacks.run('ONBRUTALCHANGED', newValue)
    }
}

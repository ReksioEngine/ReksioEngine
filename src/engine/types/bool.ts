import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { BoolDefinition } from '../../fileFormats/cnv/types'
import { method, valueAsBool } from '../../common/types'

export class Bool extends ValueType<BoolDefinition, boolean> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: BoolDefinition) {
        super(engine, parent, definition, false)
    }

    @method()
    // The arguments don't seem to matter
    async SWITCH(arg1?: boolean, arg2?: boolean) {
        await this.setValue(!this.value)
    }

    @method()
    async SET(newValue: boolean) {
        await this.setValue(newValue)
    }

    getValue(): boolean {
        return this.value
    }

    protected async valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            await this.callbacks.run('ONCHANGED', newValue)
        }
        await this.callbacks.run('ONBRUTALCHANGED', newValue)
    }

    async equals(other: ValueType<any, any>) {
        return this.getValue() === valueAsBool(await other.getValue())
    }

    // FALSE < TRUE
    async compare(other: ValueType<any, any>) {
        return Number(this.getValue()) - Number(valueAsBool(await other.getValue()))
    }

    public async toString(): Promise<string> {
        return this.getValue() ? 'TRUE' : 'FALSE'
    }
}

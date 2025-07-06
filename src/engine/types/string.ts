import { Type, ValueType } from './index'
import { Engine } from '../index'
import { StringDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'

export class String extends ValueType<StringDefinition, string> {
    constructor(engine: Engine, parent: Type<any> | null, definition: StringDefinition) {
        super(engine, parent, definition, '')
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    @method()
    async ADD(text: string) {
        await this.setValue(this.value + text)
    }

    @method()
    async SET(text: string) {
        await this.setValue(text)
    }

    @method()
    async SUB(index: number, length: number) {
        await this.setValue(this.value.substring(0, index) + this.value.substring(index + length))
    }

    @method()
    GET(index: number = 0, length?: number) {
        return this.value.substring(index, length !== undefined ? index + length : this.value.length)
    }

    @method()
    FIND(needle: string, start?: number) {
        return this.value.indexOf(needle, start)
    }

    protected async valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            await this.callbacks.run('ONCHANGED', newValue)
        }
        await this.callbacks.run('ONBRUTALCHANGED', newValue)
    }
}

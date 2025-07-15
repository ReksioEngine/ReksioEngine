import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { StringDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'

export class String extends ValueType<StringDefinition, string> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: StringDefinition) {
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
    GET(index?: number, length: number = 1) {
        if (index === undefined) {
            return this.value
        }
        return this.value.substring(index, index + length)
    }

    @method()
    FIND(needle: string, start?: number) {
        return this.value.indexOf(needle, start)
    }

    @method()
    LENGTH() {
        return this.value.length
    }

    protected async valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            await this.callbacks.run('ONCHANGED', newValue)
        }
        await this.callbacks.run('ONBRUTALCHANGED', newValue)
    }
}

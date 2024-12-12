import { Type, ValueType } from './index'
import { Engine } from '../index'
import { StringDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../types'

export class String extends ValueType<StringDefinition> {
    constructor(engine: Engine, parent: Type<any> | null, definition: StringDefinition) {
        super(engine, parent, definition, '')
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    @method()
    ADD(text: string) {
        this.value += text
    }

    @method()
    SET(text: string) {
        this.value = text
    }

    @method()
    GET() {
        return this.value
    }

    protected valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            this.callbacks.run('ONCHANGED', newValue)
        }
        this.callbacks.run('ONBRUTALCHANGED', newValue)
    }
}

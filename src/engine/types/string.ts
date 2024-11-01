import {ValueType} from './index'
import {Engine} from '../index'
import {StringDefinition} from '../../fileFormats/cnv/types'

export class String extends ValueType<StringDefinition> {
    constructor(engine: Engine, definition: StringDefinition) {
        super(engine, definition, '')
        this.callbacks.register('ONINIT', definition.ONINIT)
        this.callbacks.registerGroup('ONCHANGED', definition.ONCHANGED)
        this.callbacks.registerGroup('ONBRUTALCHANGED', definition.ONBRUTALCHANGED)
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    ADD(text: string) {
        this.value += text
    }

    SET(text: string) {
        this.value = text
    }

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

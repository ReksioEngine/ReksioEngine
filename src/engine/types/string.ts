import {Type} from './index'
import {Engine} from '../index'
import {StringDefinition} from '../../fileFormats/cnv/types'

export class String extends Type<StringDefinition> {
    private value: string

    constructor(engine: Engine, definition: StringDefinition) {
        super(engine, definition)
        this.value = definition.VALUE || ''
    }

    ADD(text: string) {
        this.value += text
    }

    SET(text: string) {
        this.value = text
    }
}

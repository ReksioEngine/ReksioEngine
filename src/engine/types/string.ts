import {Type} from './index'
import {Engine} from '../index'
import {StringDefinition} from '../../fileFormats/cnv/types'

export class String extends Type<StringDefinition> {
    constructor(engine: Engine, definition: StringDefinition) {
        super(engine, definition)
        this._value = definition.VALUE ?? ''
    }

    init() {
        this.loadFromINI()
        this.saveToINI()
    }

    ADD(text: string) {
        this.value += text
        this.ONCHANGED()
    }

    SET(text: string) {
        this.value = text
        this.ONCHANGED()
    }

    private ONCHANGED() {
        this.saveToINI()
    }
}

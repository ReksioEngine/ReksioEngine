import {Type} from './index'
import {Engine} from '../index'
import {ButtonDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'

export class Button extends Type<ButtonDefinition> {
    private enabled: boolean
    private visible: boolean

    constructor(engine: Engine, definition: ButtonDefinition) {
        super(engine, definition)
        this.enabled = definition.ENABLE
        this.visible = definition.VISIBLE
    }

    ENABLE() {
        this.enabled = true
    }

    DISABLE() {
        this.enabled = false
        this.visible = false
    }

    DISABLEBUTVISIBLE() {
        this.enabled = false
        this.visible = true
    }

    SETPRIORITY() {
        throw new NotImplementedError()
    }
}

import {Type} from './index'
import {Engine} from '../index'
import {callback, MouseDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'

export class Mouse extends Type<MouseDefinition> {
    private enabled: boolean = true
    private cursorType: string = 'ARROW'

    private readonly onClick: callback

    constructor(engine: Engine, definition: MouseDefinition) {
        super(engine, definition)
        this.onClick = definition.ONCLICK
    }

    // ACTIVE, ARROW
    SET(cursorType: string) {
        this.cursorType = cursorType
    }

    ENABLE() {
        this.enabled = true
    }

    DISABLE() {
        this.enabled = false
    }

    GETPOSX() {
        throw NotImplementedError
    }

    GETPOSY() {
        throw NotImplementedError
    }

    ONCLICK() {
        if (this.onClick) {
            this.engine.executeCallback(this, this.onClick)
        }
    }
}

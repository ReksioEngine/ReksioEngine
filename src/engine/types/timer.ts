import {Type} from './index'
import {callback, TimerDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {Integer} from './integer'
import {NotImplementedError} from '../../utils'

export class Timer extends Type<TimerDefinition> {
    private currentTick: number = 0
    private elapse: number
    private enabled: boolean

    private readonly onTick: Record<number, callback>

    constructor(engine: Engine, definition: TimerDefinition) {
        super(engine, definition)
        this.elapse = definition.ELAPSE
        this.enabled = definition.ENABLED // if this is set to false then even ONINIT doesn't start
        this.onTick = definition.ONTICK
    }

    init() {
        if (this.definition.ONINIT) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }
    }

    SETELAPSE(newElapse: number | Integer) {
        if (newElapse instanceof Integer) {
            this.elapse = newElapse.value
        } else {
            this.elapse = newElapse
        }
    }

    RESET() {
        throw new NotImplementedError()
    }

    DISABLE() {
        this.enabled = false
    }

    ENABLE() {
        this.enabled = true
    }

    ONTICK() {
        if (Object.prototype.hasOwnProperty.call(this.onTick, this.currentTick)) {
            this.engine.executeCallback(this, this.onTick[this.currentTick])
        }
    }
}

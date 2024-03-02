import {Type} from './index'
import {callback, TimerDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {Integer} from './integer'

export class Timer extends Type<TimerDefinition> {
    private currentTick: number = 0
    private timeCounter: number = 0

    private elapse: number
    private enabled: boolean

    private readonly onTick: Record<number, callback>

    constructor(engine: Engine, definition: TimerDefinition) {
        super(engine, definition)
        this.elapse = definition.ELAPSE
        this.enabled = definition.ENABLED
        this.onTick = definition.ONTICK
    }

    init() {
        if (this.definition.ONINIT && this.enabled) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }
    }

    tick(delta: number) {
        if (!this.enabled) {
            return
        }

        this.timeCounter += delta
        const missedTicks = Math.floor(this.timeCounter) % this.elapse
        this.timeCounter -= this.elapse * missedTicks

        for (let tick = 0; tick < missedTicks; tick++) {
            this.currentTick++
            this.ONTICK()
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
        this.timeCounter = 0
        this.currentTick = 0
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

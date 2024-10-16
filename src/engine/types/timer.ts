import {Type} from './index'
import {TimerDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {Integer} from './integer'

export class Timer extends Type<TimerDefinition> {
    private currentTick: number = 0
    private collectedTime: number = 0

    private elapse: number
    private enabled: boolean

    constructor(engine: Engine, definition: TimerDefinition) {
        super(engine, definition)
        this.elapse = definition.ELAPSE
        this.enabled = definition.ENABLED ?? true

        this.callbacks.registerGroup('ONTICK', definition.ONTICK)
        this.callbacks.register('ONINIT', definition.ONINIT)
    }

    ready() {
        if (this.enabled) {
            this.callbacks.run('ONINIT')
        }
        this.RESET()
    }

    destroy() {
        this.DISABLE()
    }

    tick(elapsedMS: number) {
        if (!this.enabled) {
            return
        }

        this.collectedTime += elapsedMS * this.engine.speed

        while (this.collectedTime >= this.elapse) {
            this.currentTick++
            this.ONTICK()
            this.collectedTime -= this.elapse

            const ticksLimit = this.definition.TICKS ?? 0
            if (ticksLimit > 0 && this.currentTick >= ticksLimit) {
                this.DISABLE()
                return
            }
        }
    }

    SETELAPSE(newElapse: number | Integer) {
        if (newElapse instanceof Integer) {
            this.elapse = newElapse.value
        } else {
            this.elapse = newElapse
        }
    }

    SET(value: number) {
        this.collectedTime = value
    }

    RESET() {
        this.collectedTime = 0
        this.currentTick = 0
    }

    DISABLE() {
        this.enabled = false
    }

    ENABLE() {
        this.enabled = true
        this.collectedTime = 0
    }

    ONTICK() {
        this.callbacks.run('ONTICK', this.currentTick)
    }
}

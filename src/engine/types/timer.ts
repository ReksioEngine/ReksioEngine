import { Type } from './index'
import { TimerDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { method } from '../../types'

export class Timer extends Type<TimerDefinition> {
    private currentTick: number = 0
    private collectedTime: number = 0

    private elapse: number
    private enabled: boolean

    constructor(engine: Engine, definition: TimerDefinition) {
        super(engine, definition)
        this.elapse = definition.ELAPSE
        this.enabled = definition.ENABLED ?? true
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
            this.callbacks.run('ONTICK', this.currentTick)
            this.collectedTime -= this.elapse

            const ticksLimit = this.definition.TICKS ?? 0
            if (ticksLimit > 0 && this.currentTick >= ticksLimit) {
                this.DISABLE()
                return
            }
        }
    }

    @method()
    SETELAPSE(newElapse: number) {
        this.elapse = newElapse
    }

    @method()
    SET(value: number) {
        this.collectedTime = value
    }

    @method()
    RESET() {
        this.collectedTime = 0
        this.currentTick = 0
    }

    @method()
    DISABLE() {
        this.enabled = false
    }

    @method()
    ENABLE() {
        this.enabled = true
        this.collectedTime = 0
    }
}

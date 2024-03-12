import {Type} from './index'
import {TimerDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {Integer} from './integer'

export class Timer extends Type<TimerDefinition> {
    private currentTick: number = 0
    private startTime: number = 0

    private elapse: number
    private enabled: boolean

    constructor(engine: Engine, definition: TimerDefinition) {
        super(engine, definition)
        this.elapse = definition.ELAPSE
        this.enabled = definition.ENABLED

        this.callbacks.registerGroup('ONTICK', definition.ONTICK)
        this.callbacks.register('ONINIT', definition.ONINIT)
    }

    init() {}

    ready() {
        if (this.enabled) {
            this.callbacks.run('ONINIT')
        }
        this.RESET()
    }

    destroy() {
        this.DISABLE()
    }

    tick(delta: number) {
        if (!this.enabled) {
            return
        }

        const expectedTick = Math.floor((Date.now() - this.startTime) / this.elapse)
        while (this.currentTick < expectedTick) {
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
        this.startTime = Date.now()
        this.currentTick = 0
    }

    DISABLE() {
        this.enabled = false
    }

    ENABLE() {
        this.enabled = true
        this.startTime = Date.now()
    }

    ONTICK() {
        this.callbacks.run('ONTICK', this.currentTick)
    }
}

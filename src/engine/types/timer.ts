import {Type} from './index'
import {TimerDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {Integer} from './integer'
import {callbacks} from '../../fileFormats/common'

export class Timer extends Type<TimerDefinition> {
    private currentTick: number = 0
    private startTime: number = 0

    private elapse: number
    private enabled: boolean

    private readonly onTick: callbacks<number>

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

    ready() {
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
    }

    ONTICK() {
        if (this.onTick) {
            if (this.onTick.nonParametrized) {
                this.engine.executeCallback(this, this.onTick.nonParametrized)
            }
            if (this.onTick.parametrized && this.onTick.parametrized.has(this.currentTick)) {
                this.engine.executeCallback(this, this.onTick.parametrized.get(this.currentTick)!)
            }
        }
    }
}

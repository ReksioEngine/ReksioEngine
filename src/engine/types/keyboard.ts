import { ParentType, Type } from './index'
import { KeyboardDefinition, MusicDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { method } from '../../common/types'
import { logger } from '../logging'

const keysMapping = {
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    Space: 'SPACE',
    Digit1: '1',
    Digit2: '2',
} as any

type KeyState = { name: string; state: boolean }

export class Keyboard extends Type<KeyboardDefinition> {
    private keysState = new Map<string, boolean>()
    private changeQueue: KeyState[] = []
    private enabled: boolean = true

    private readonly onKeyDownCallback: (event: KeyboardEvent) => void
    private readonly onKeyUpCallback: (event: KeyboardEvent) => void

    constructor(engine: Engine, parent: ParentType<any> | null, definition: MusicDefinition) {
        super(engine, parent, definition)
        this.onKeyDownCallback = this.onKeyDown.bind(this)
        this.onKeyUpCallback = this.onKeyUp.bind(this)
    }

    async ready() {
        window.addEventListener('keydown', this.onKeyDownCallback)
        window.addEventListener('keyup', this.onKeyUpCallback)
    }

    destroy() {
        window.removeEventListener('keydown', this.onKeyDownCallback)
        window.removeEventListener('keyup', this.onKeyUpCallback)
    }

    async tick() {
        for (const change of this.changeQueue) {
            if (change.state) {
                await this.callbacks.run('ONKEYDOWN', change.name)
            } else {
                await this.callbacks.run('ONKEYUP', change.name)
            }
        }
        this.changeQueue = []
    }

    @method()
    DISABLE() {
        this.enabled = false
    }

    @method()
    ISKEYDOWN(keyName: string) {
        if (this.keysState.has(keyName)) {
            return this.keysState.get(keyName)!
        }
        return false
    }

    @method()
    ISENABLED() {
        return this.enabled
    }

    private onKeyDown(event: KeyboardEvent) {
        if (this.enabled) {
            this.setKeyState(event.code, true)
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        if (this.enabled) {
            this.setKeyState(event.code, false)
        }
    }

    private setKeyState(keyCode: string, value: boolean) {
        const mapped = keysMapping[keyCode]
        if (!mapped) {
            logger.warn(`Unsupported keyboard key code ${keyCode}`, {
                supportedKeys: Object.keys(keysMapping)
            })
        }
        this.keysState.set(mapped, value)
        this.changeQueue.push({ name: mapped, state: value })
    }
}

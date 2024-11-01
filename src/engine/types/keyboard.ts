import {Type} from './index'
import {KeyboardDefinition, MusicDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'

const keysMapping = {
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    Space: 'SPACE',
    Digit1: '1',
    Digit2: '2'
} as any

type KeyState = {name: string, state: boolean}

export class Keyboard extends Type<KeyboardDefinition> {
    private keysState = new Map<string, boolean>()
    private changeQueue: KeyState[] = []

    private readonly onKeyDownCallback: (event: KeyboardEvent) => void
    private readonly onKeyUpCallback: (event: KeyboardEvent) => void

    constructor(engine: Engine, definition: MusicDefinition) {
        super(engine, definition)
        this.onKeyDownCallback = this.onKeyDown.bind(this)
        this.onKeyUpCallback = this.onKeyUp.bind(this)

        this.callbacks.registerGroup('ONKEYDOWN', this.definition.ONKEYDOWN)
        this.callbacks.registerGroup('ONKEYUP', this.definition.ONKEYUP)
    }

    ready() {
        window.addEventListener('keydown', this.onKeyDownCallback)
        window.addEventListener('keyup', this.onKeyUpCallback)
    }

    destroy() {
        window.removeEventListener('keydown', this.onKeyDownCallback)
        window.removeEventListener('keyup', this.onKeyUpCallback)
    }

    tick() {
        for (const change of this.changeQueue) {
            if (change.state) {
                this.callbacks.run('ONKEYDOWN', change.name)
            } else {
                this.callbacks.run('ONKEYUP', change.name)
            }
        }
        this.changeQueue = []
    }

    ISKEYDOWN(keyName: string) {
        if (this.keysState.has(keyName)) {
            return this.keysState.get(keyName)!
        }
        return false
    }

    private onKeyDown(event: KeyboardEvent) {
        this.setKeyState(event.code, true)
    }

    private onKeyUp(event: KeyboardEvent) {
        this.setKeyState(event.code, false)
    }

    private setKeyState(keyCode: string, value: boolean) {
        const mapped = keysMapping[keyCode]
        if (!mapped) {
            console.warn(`Unsupported keyboard key code ${keyCode}`)
        }
        this.keysState.set(mapped, value)
        this.changeQueue.push({name: mapped, state: value})
    }
}

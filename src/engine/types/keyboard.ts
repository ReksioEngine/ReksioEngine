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

export class Keyboard extends Type<KeyboardDefinition> {
    private keysState = new Map<string, boolean>()

    private readonly onKeyDownCallback: (event: KeyboardEvent) => void
    private readonly onKeyUpCallback: (event: KeyboardEvent) => void

    constructor(engine: Engine, definition: MusicDefinition) {
        super(engine, definition)
        this.onKeyDownCallback = this.onKeyDown.bind(this)
        this.onKeyUpCallback = this.onKeyUp.bind(this)
    }

    ready() {
        window.addEventListener('keydown', this.onKeyDownCallback)
        window.addEventListener('keyup', this.onKeyUpCallback)
    }

    destroy() {
        window.removeEventListener('keydown', this.onKeyDownCallback)
        window.removeEventListener('keyup', this.onKeyUpCallback)
    }

    onKeyDown(event: KeyboardEvent) {
        this.setKeyState(event.code, true)
    }

    onKeyUp(event: KeyboardEvent) {
        this.setKeyState(event.code, false)
    }

    setKeyState(keyCode: string, value: boolean) {
        const mapped = keysMapping[keyCode]
        if (!mapped) {
            console.warn(`Unsupported keyboard key code ${keyCode}`)
        }
        this.keysState.set(mapped, value)
    }

    ISKEYDOWN(keyName: string) {
        if (this.keysState.has(keyName)) {
            return this.keysState.get(keyName)!
        }
        return false
    }
}

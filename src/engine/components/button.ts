import { DisplayObject } from 'pixi.js'
import { StateMachine, t } from '../../stateMachine'

export enum State {
    INIT = 'INIT',
    DISABLED = 'DISABLED',
    DISABLED_BUT_VISIBLE = 'DISABLED_BUT_VISIBLE',
    STANDARD = 'STANDARD',
    HOVERED = 'HOVERED',
    PRESSED = 'PRESSED',
}

export enum Event {
    OVER = 'OVER',
    DOWN = 'DOWN',
    UP = 'UP',
    OUT = 'OUT',
    ENABLE = 'ENABLE',
    DISABLE = 'DISABLE',
    DISABLE_BUT_VISIBLE = 'DISABLE_BUT_VISIBLE',
}

type stateChangeCallback = (prevState: State, event: Event, newState: State) => void

export class ButtonLogicComponent {
    private stateMachine: StateMachine<State, Event>
    private readonly onStateChangeCallback: stateChangeCallback

    private readonly onMouseOverCallback
    private readonly onMouseOutCallback
    private readonly onMouseDownCallback
    private readonly onMouseUpCallback

    constructor(onStateChange: stateChangeCallback) {
        this.onStateChangeCallback = onStateChange

        this.onMouseOverCallback = this.onMouseOver.bind(this)
        this.onMouseOutCallback = this.onMouseOut.bind(this)
        this.onMouseDownCallback = this.onMouseDown.bind(this)
        this.onMouseUpCallback = this.onMouseUp.bind(this)

        const transitions = [
            t(State.INIT, Event.DISABLE, State.DISABLED),
            t(State.INIT, Event.DISABLE_BUT_VISIBLE, State.DISABLED_BUT_VISIBLE),
            t(State.INIT, Event.ENABLE, State.STANDARD),

            t(State.STANDARD, Event.OVER, State.HOVERED),
            t(State.STANDARD, Event.DISABLE, State.DISABLED),
            t(State.STANDARD, Event.DISABLE_BUT_VISIBLE, State.DISABLED_BUT_VISIBLE),

            t(State.HOVERED, Event.DISABLE, State.DISABLED),
            t(State.HOVERED, Event.DISABLE_BUT_VISIBLE, State.DISABLED_BUT_VISIBLE),
            t(State.HOVERED, Event.OUT, State.STANDARD),
            t(State.HOVERED, Event.DOWN, State.PRESSED),

            t(State.PRESSED, Event.DISABLE, State.DISABLED),
            t(State.PRESSED, Event.DISABLE_BUT_VISIBLE, State.DISABLED_BUT_VISIBLE),
            t(State.PRESSED, Event.UP, State.HOVERED),
            t(State.PRESSED, Event.OUT, State.STANDARD),

            t(State.DISABLED, Event.ENABLE, State.STANDARD),
            t(State.DISABLED, Event.DISABLE_BUT_VISIBLE, State.DISABLED_BUT_VISIBLE),

            t(State.DISABLED_BUT_VISIBLE, Event.ENABLE, State.STANDARD),
            t(State.DISABLED_BUT_VISIBLE, Event.DISABLE, State.DISABLED),
        ]
        this.stateMachine = new StateMachine<State, Event>(State.INIT, transitions, this.onStateChangeCallback)
    }

    registerInteractive(sprite: DisplayObject, showPointer = true) {
        sprite.eventMode = 'dynamic'
        sprite.cursor = showPointer ? 'pointer' : 'default'

        sprite.addListener('pointerover', this.onMouseOverCallback)
        sprite.addListener('pointerout', this.onMouseOutCallback)
        sprite.addListener('pointerdown', this.onMouseDownCallback)
        sprite.addListener('pointerup', this.onMouseUpCallback)
    }

    unregisterInteractive(sprite: DisplayObject) {
        sprite.eventMode = 'none'
        sprite.cursor = 'default'

        sprite.removeListener('pointerover', this.onMouseOverCallback)
        sprite.removeListener('pointerout', this.onMouseOutCallback)
        sprite.removeListener('pointerdown', this.onMouseDownCallback)
        sprite.removeListener('pointerup', this.onMouseUpCallback)
    }

    disable() {
        if (this.stateMachine.can(Event.DISABLE)) {
            this.stateMachine.dispatch(Event.DISABLE)
        }
    }

    disableButVisible() {
        if (this.stateMachine.can(Event.DISABLE_BUT_VISIBLE)) {
            this.stateMachine.dispatch(Event.DISABLE_BUT_VISIBLE)
        }
    }

    enable() {
        if (this.stateMachine.can(Event.ENABLE)) {
            this.stateMachine.dispatch(Event.ENABLE)
        }
    }

    private onMouseOver() {
        if (this.stateMachine.can(Event.OVER)) {
            this.stateMachine.dispatch(Event.OVER)
        }
    }

    private onMouseUp() {
        if (this.stateMachine.can(Event.UP)) {
            this.stateMachine.dispatch(Event.UP)
        }
    }

    private onMouseOut() {
        if (this.stateMachine.can(Event.OUT)) {
            this.stateMachine.dispatch(Event.OUT)
        }
    }

    private onMouseDown() {
        if (this.stateMachine.can(Event.DOWN)) {
            this.stateMachine.dispatch(Event.DOWN)
        }
    }
}

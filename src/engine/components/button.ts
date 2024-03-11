import {StateMachine, t} from 'typescript-fsm'
import {Container} from '@pixi/display'

export enum State {
    INIT,
    DISABLED,
    DISABLED_BUT_VISIBLE,
    STANDARD,
    HOVERED,
    PRESSED
}

enum Event {
    OVER,
    DOWN,
    UP,
    OUT,
    ENABLE,
    DISABLE,
    DISABLE_BUT_VISIBLE
}

type stateChangeCallback = (state: State) => void

export class ButtonLogicComponent {
    private stateMachine: StateMachine<State, Event>
    private onStateChangeCallback: stateChangeCallback

    private readonly onMouseOverCallback
    private readonly onMouseOutCallback
    private readonly onMouseDownCallback
    private readonly onMouseUpCallback

    private readonly onMouseOverCustomCallback
    private readonly onMouseOutCustomCallback
    private readonly onMouseDownCustomCallback
    private readonly onMouseUpCustomCallback

    constructor(
        onStateChange: stateChangeCallback,
        onMouseOver?: () => void,
        onMouseOut?: () => void,
        onMouseUp?: () => void,
        onMouseDown?: () => void,
    ) {
        this.onStateChangeCallback = onStateChange
        this.onMouseOverCustomCallback = onMouseOver
        this.onMouseOutCustomCallback = onMouseOut
        this.onMouseUpCustomCallback = onMouseUp
        this.onMouseDownCustomCallback = onMouseDown

        this.onMouseOverCallback = this.onMouseOver.bind(this)
        this.onMouseOutCallback = this.onMouseOut.bind(this)
        this.onMouseDownCallback = this.onMouseDown.bind(this)
        this.onMouseUpCallback = this.onMouseUp.bind(this)

        const stateCallback = this.onStateChange.bind(this)
        const transitions = [
            t(State.INIT, Event.ENABLE, State.STANDARD, stateCallback),
            t(State.INIT, Event.DISABLE, State.DISABLED, stateCallback),

            t(State.STANDARD, Event.OVER, State.HOVERED, stateCallback),
            t(State.HOVERED, Event.OUT, State.STANDARD, stateCallback),
            t(State.HOVERED, Event.DOWN, State.PRESSED, stateCallback),
            t(State.PRESSED, Event.UP, State.HOVERED, stateCallback),
            t(State.PRESSED, Event.OUT, State.STANDARD, stateCallback),
            t(State.DISABLED, Event.ENABLE, State.STANDARD, stateCallback),

            t(State.STANDARD, Event.DISABLE, State.DISABLED, stateCallback),
            t(State.HOVERED, Event.DISABLE, State.DISABLED, stateCallback),
            t(State.PRESSED, Event.DISABLE, State.DISABLED, stateCallback),

            t(State.STANDARD, Event.ENABLE, State.STANDARD, stateCallback),
            t(State.DISABLED, Event.DISABLE, State.DISABLED, stateCallback),
        ]
        this.stateMachine = new StateMachine<State, Event>(
            State.INIT,
            transitions
        )
    }

    registerInteractive(sprite: Container) {
        sprite.interactive = true
        sprite.cursor = 'pointer'

        sprite.addListener('mouseover', this.onMouseOverCallback)
        sprite.addListener('mouseout', this.onMouseOutCallback)
        sprite.addListener('mousedown', this.onMouseDownCallback)
        sprite.addListener('mouseup', this.onMouseUpCallback)
    }

    unregisterInteractive(sprite: Container) {
        sprite.interactive = false
        sprite.cursor = 'default'

        sprite.removeListener('mouseover', this.onMouseOverCallback)
        sprite.removeListener('mouseout', this.onMouseOutCallback)
        sprite.removeListener('mousedown', this.onMouseDownCallback)
        sprite.removeListener('mouseup', this.onMouseUpCallback)
    }

    getState() {
        return this.stateMachine.getState()
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

    onMouseOver() {
        if (this.stateMachine.getState() == State.DISABLED) {
            return
        }

        if (this.stateMachine.can(Event.OVER)) {
            this.stateMachine.dispatch(Event.OVER)
        }

        this.onMouseOverCustomCallback && this.onMouseOverCustomCallback()
    }

    onMouseUp() {
        if (this.stateMachine.getState() == State.DISABLED) {
            return
        }

        if (this.stateMachine.can(Event.UP)) {
            this.stateMachine.dispatch(Event.UP)
        }

        this.onMouseUpCustomCallback && this.onMouseUpCustomCallback()
    }

    onMouseOut() {
        if (this.stateMachine.getState() == State.DISABLED) {
            return
        }

        if (this.stateMachine.can(Event.OUT)) {
            this.stateMachine.dispatch(Event.OUT)
        }

        this.onMouseOutCustomCallback && this.onMouseOutCustomCallback()
    }

    onMouseDown() {
        if (this.stateMachine.getState() == State.DISABLED) {
            return
        }

        if (this.stateMachine.can(Event.DOWN)) {
            this.stateMachine.dispatch(Event.DOWN)
        }

        this.onMouseDownCustomCallback && this.onMouseDownCustomCallback()
    }

    onStateChange() {
        const state = this.stateMachine.getState()
        this.onStateChangeCallback(state)
    }
}
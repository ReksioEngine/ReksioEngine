import {StateMachine, t} from 'typescript-fsm'
import {DisplayObject} from 'pixi.js'

export enum State {
    INIT,
    DISABLED,
    DISABLED_BUT_VISIBLE,
    STANDARD,
    HOVERED,
    PRESSED
}

export enum Event {
    OVER,
    DOWN,
    UP,
    OUT,
    ENABLE,
    DISABLE,
    DISABLE_BUT_VISIBLE
}

type stateChangeCallback = (prevState: State, event: Event, newState: State) => void

export class ButtonLogicComponent {
    private stateMachine: StateMachine<State, Event>
    private readonly onStateChangeCallback: stateChangeCallback
    private prevState: State = State.DISABLED

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
            t(State.INIT, Event.ENABLE, State.STANDARD, () => stateCallback(Event.ENABLE)),
            t(State.INIT, Event.DISABLE, State.DISABLED, () => stateCallback(Event.DISABLE)),

            t(State.STANDARD, Event.OVER, State.HOVERED, () => stateCallback(Event.OVER)),
            t(State.HOVERED, Event.OUT, State.STANDARD, () => stateCallback(Event.OUT)),
            t(State.HOVERED, Event.DOWN, State.PRESSED, () => stateCallback(Event.DOWN)),
            t(State.PRESSED, Event.UP, State.HOVERED, () => stateCallback(Event.UP)),
            t(State.PRESSED, Event.OUT, State.STANDARD, () => stateCallback(Event.OUT)),
            t(State.DISABLED, Event.ENABLE, State.STANDARD, () => stateCallback(Event.ENABLE)),

            t(State.STANDARD, Event.DISABLE, State.DISABLED, () => stateCallback(Event.DISABLE)),
            t(State.HOVERED, Event.DISABLE, State.DISABLED, () => stateCallback(Event.DISABLE)),
            t(State.PRESSED, Event.DISABLE, State.DISABLED, () => stateCallback(Event.DISABLE)),

            t(State.STANDARD, Event.ENABLE, State.STANDARD, () => stateCallback(Event.ENABLE)),
            t(State.DISABLED, Event.DISABLE, State.DISABLED, () => stateCallback(Event.DISABLE)),
        ]
        this.stateMachine = new StateMachine<State, Event>(
            State.INIT,
            transitions
        )
    }

    registerInteractive(sprite: DisplayObject) {
        sprite.interactive = true
        sprite.cursor = 'pointer'

        sprite.addListener('pointerover', this.onMouseOverCallback)
        sprite.addListener('pointerout', this.onMouseOutCallback)
        sprite.addListener('pointerdown', this.onMouseDownCallback)
        sprite.addListener('pointerup', this.onMouseUpCallback)
    }

    unregisterInteractive(sprite: DisplayObject) {
        sprite.interactive = false
        sprite.cursor = 'default'

        sprite.removeListener('pointerover', this.onMouseOverCallback)
        sprite.removeListener('pointerout', this.onMouseOutCallback)
        sprite.removeListener('pointerdown', this.onMouseDownCallback)
        sprite.removeListener('pointerup', this.onMouseUpCallback)
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

    onStateChange(event: Event) {
        const state = this.stateMachine.getState()
        this.onStateChangeCallback(this.prevState, event, state)
        this.prevState = state
    }
}
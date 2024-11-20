export interface Transition<STATE, EVENT> {
    from: STATE
    event: EVENT
    to: STATE
}

export type Callback<STATE extends number | string, EVENT extends number | string> = (
    previousState: STATE,
    event: EVENT,
    newState: STATE
) => void

export class StateMachine<STATE extends number | string, EVENT extends number | string> {
    private currentState: STATE
    private readonly onStateChange: Callback<STATE, EVENT>

    constructor(
        initialState: STATE,
        protected transitions: Transition<STATE, EVENT>[] = [],
        onStateChange: Callback<STATE, EVENT>
    ) {
        this.currentState = initialState
        this.onStateChange = onStateChange
    }

    getState() {
        return this.currentState
    }

    can(event: EVENT): boolean {
        return this.transitions.some(
            (transition) => transition.from === this.currentState && transition.event === event
        )
    }

    dispatch(event: EVENT) {
        const transition = this.transitions.find(
            (transition) => transition.from === this.currentState && transition.event === event
        )

        if (transition === undefined) {
            throw new Error('No transition found for event from current state')
        }

        const previousState = this.currentState
        this.currentState = transition.to

        this.onStateChange(previousState, event, this.currentState)
    }
}

export function t<STATE extends number | string, EVENT extends number | string>(
    from: STATE,
    event: EVENT,
    to: STATE
): Transition<STATE, EVENT> {
    return {
        from,
        event,
        to,
    }
}

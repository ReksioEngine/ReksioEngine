import { StackFrame } from '../interpreter/stacktrace'

export class EngineError extends Error {
    public stackTrace: StackFrame[] | null
    constructor(message: string, stackTrace: StackFrame[] | null = null) {
        super(message)
        this.stackTrace = stackTrace
    }
}

export class IrrecoverableError extends EngineError {}
export class UnexpectedError extends EngineError {}
export class InvalidObjectError extends EngineError {
    constructor(message: string) {
        super(message)
    }
}
export class NotImplementedError extends EngineError {
    constructor(message?: string) {
        super(message ?? 'Not implemented')
    }
}

export class IgnorableError {}
export class CancelTick extends IgnorableError {
    constructor(public callback?: () => Promise<void>) {
        super()
    }
}
export class InterruptScriptExecution extends IgnorableError {
    public one: boolean
    constructor(one: boolean = false) {
        super()
        this.one = one
    }
}
export function assert(expr: boolean, message?: string): asserts expr {
    if (!expr) {
        throw new Error('Unexpected error occurred' + (message !== undefined ? `: ${message}` : ''))
    }
}

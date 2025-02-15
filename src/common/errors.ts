import { StackFrame } from '../interpreter/script/stacktrace'

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

export function assert(expr: any, message?: string): asserts expr {
    if (!expr) {
        throw new UnexpectedError('Unexpected error occurred' + (message !== undefined ? `: ${message}` : ''))
    }
}

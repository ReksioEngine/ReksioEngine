import { StackFrame } from './interpreter/script/stacktrace'

export class EngineError extends Error {
    public stackTrace: StackFrame[] | null
    constructor(message: string, stackTrace: StackFrame[] | null = null) {
        super(message)
        this.stackTrace = stackTrace
    }
}

export class IrrecoverableError extends EngineError {}

export class InterpreterError extends IrrecoverableError {
    public script: string
    public line: number
    public column: number

    constructor(message: string, script: string, line: number, column: number, stackTrace: StackFrame[]) {
        super(message + ` at ${line}:${column}\n${script}`, stackTrace)
        this.script = script
        this.line = line
        this.column = column
    }
}

export class LexerError extends InterpreterError {}
export class ParserError extends InterpreterError {}

export class UnexpectedError extends Error {}
export class InvalidObjectError extends Error {
    constructor(message: string) {
        super(message)
    }
}
export class NotImplementedError extends Error {
    constructor() {
        super('Not implemented')
    }
}

export function assert(expr: any, message?: string): asserts expr {
    if (!expr) {
        throw new UnexpectedError('Unexpected error occurred' + (message !== undefined ? `: ${message}` : ''))
    }
}

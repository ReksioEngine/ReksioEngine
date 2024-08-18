export class IrrecoverableError extends Error {}
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

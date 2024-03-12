export class IrrecoverableError extends Error {}
export class UnexpectedError extends Error {}

export function assert(expr: any): asserts expr {
    if (!expr) {
        throw new UnexpectedError('Unexpected error occurred')
    }
}

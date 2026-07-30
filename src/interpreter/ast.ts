export type ExprOp = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MOD'

export const EXPR_OP_CODE: Record<ExprOp, number> = {
    ADD: 1,
    SUB: 2,
    MUL: 3,
    DIV: 4,
    MOD: 5,
}

export const EXPR_OP_SYMBOL: Record<string, ExprOp> = {
    '+': 'ADD',
    '-': 'SUB',
    '*': 'MUL',
    '@': 'DIV',
    '%': 'MOD',
}

export interface ExprStep {
    op: ExprOp
    opCode: number
    operand: Parameter
    start: number
    end: number
}

/**
 * A flat expression: head (op operand)*
 *
 * Mirrors the CMC_Expression internal array which alternates:
 *   [operand0, CInteger(op1), operand1, CInteger(op2), operand2, …]
 *
 * Evaluated strictly left-to-right by calculate():
 *   result = eval(head)
 *   for each step: result = result.apply(step.op, eval(step.operand))
 *
 * NO operator precedence. Use nested brackets for grouping.
 */
export interface Expression {
    type: 'Expression'
    head: Parameter
    tail: ExprStep[]
    start: number
    end: number
}

export interface NumberLiteral {
    type: 'NumberLiteral'
    value: string
    start: number
    end: number
}

export interface StringLiteral {
    type: 'StringLiteral'
    value: string
    start: number
    end: number
}

export interface BooleanLiteral {
    type: 'BooleanLiteral'
    value: boolean
    start: number
    end: number
}

/**
 * Bracket-enclosed expression: `[expr]`
 *
 * `raw` preserves the original text.
 * `expression` is the parsed flat Expression AST.
 *
 * In the original engine the string inside brackets is passed to
 * the CMC_Expression(CXString) constructor which splits on `+-*@%`.
 */
export interface BracketExpression {
    type: 'BracketExpression'
    raw: string
    expression: Expression
    start: number
    end: number
}

export interface Identifier {
    type: 'Identifier'
    name: string
    start: number
    end: number
}

/**
 * Structure field access: `object|field`
 *
 * Maps to `CMC_Structure::getField` at runtime.
 */
export interface FieldAccess {
    type: 'FieldAccess'
    objectName: string
    fieldName: string
    start: number
    end: number
}

/**
 * `CONV...` prefix.
 *
 * The original interpreter prepends '@' and feeds the result back
 * through runLine, dispatching on the global runner.
 */
export interface ConversionCall {
    type: 'ConversionCall'
    text: string
    start: number
    end: number
}

export interface ThisRef {
    type: 'ThisRef'
    start: number
    end: number
}

/**
 * `#...` - object looked up by a 7-bit ID.
 *
 * `resolveObject`: `getObject(param_1, (byte)code.buffer[2] & 0x7F)`
 */
export interface DirectRef {
    type: 'DirectRef'
    idByte: number
    start: number
    end: number
}

export interface IndirectRef {
    type: 'IndirectRef'
    inner: Parameter
    start: number
    end: number
}

/** `@` prefix - dispatch via the global/default runner (runner 0). */
export interface GlobalTarget {
    type: 'GlobalTarget'
    start: number
    end: number
}

/** Named/resolved object used as a call target. */
export interface ObjectTarget {
    type: 'ObjectTarget'
    ref: ThisRef | DirectRef | IndirectRef | Identifier
    start: number
    end: number
}

/**
 * Function / method invocation.
 *
 * Syntax: `[prefix][target^]method(args)`
 *
 * `target` is `null` when no object prefix is present and the line
 * is dispatched purely by method name.
 */
export interface FunctionCall {
    type: 'FunctionCall'
    target: GlobalTarget | ObjectTarget | null
    method: string
    args: Parameter[]
    isHashMethod: boolean
    start: number
    end: number
}

/**
 * Complete behaviour block (list of code lines + optional condition).
 *
 * Maps to `CMC_Behaviour::run` which iterates `codeLines[]`.
 */
export interface Behaviour {
    type: 'Behaviour'
    condition: string | null
    lines: Statement[]
    start: number
    end: number
}

export type Parameter =
    | NumberLiteral
    | StringLiteral
    | BooleanLiteral
    | BracketExpression
    | Identifier
    | FieldAccess
    | ConversionCall
    | FunctionCall

export type Statement = FunctionCall | Parameter
export type ASTNode = Statement | Expression | Behaviour | GlobalTarget | ObjectTarget

export type ObjectRef = ThisRef | DirectRef | Identifier

import {
    FunctionCall,
    Parameter,
    Statement,
    ObjectTarget,
    ObjectRef,
    IndirectRef,
    Expression,
    ExprStep,
    ExprOp,
    EXPR_OP_SYMBOL,
    EXPR_OP_CODE,
} from './ast'
import { valueAsBool } from '../common/types'

const OPERATOR_CHARS = ['+', '-', '*', '@', '%']

export class ParseError extends Error {
    text: string
    position: number

    constructor(message: string, text = '', position = -1) {
        const detail = position >= 0 ? ` at position ${position}` : ''
        const ctx = text ? ` in '${text}'` : ''
        super(`Parse error${detail}${ctx}: ${message}`)
        this.name = 'ParseError'
        this.text = text
        this.position = position
    }
}

/**
 * Parse a semicolon-delimited code string into a list of Statements.
 */
export function parseCode(code: string): Statement[] {
    const results: Statement[] = []
    let depth = 0
    let start = 0

    for (let i = 0; i < code.length; i++) {
        const ch = code[i]
        if (ch === '(') depth++
        else if (ch === ')') depth--
        else if (ch === ';' && depth === 0) {
            const stmt = code.slice(start, i).trim()
            if (stmt) {
                const stmtStart = code.indexOf(stmt, start)
                results.push(parseLine(stmt, stmtStart))
            }
            start = i + 1
        }
    }

    const last = code.slice(start).trim()
    if (last) {
        const lastStart = code.indexOf(last, start)
        results.push(parseLine(last, lastStart))
    }
    return results
}

/**
 * Parse one line of CMC code into Statement.
 *
 * Mirrors `CMC_Behaviour::runLine`.
 *
 * If the line has no parentheses, no caret, and no `@`/`*` prefix,
 * it's a bare value (number, identifier, etc.) and is parsed via
 * `parseParameter` instead of being forced into a FunctionCall.
 * This handles cases like `1234` -> NumberLiteral or `TRUE` -> Identifier.
 */
export function parseLine(text: string, offset = 0): Statement {
    const originalText = text
    text = text.trim()
    const trimOffset = offset + originalText.indexOf(text)

    if (!text) throw new ParseError('empty line', text)

    const parenPos = text.indexOf('(')

    // '@' prefix: global runner
    if (text[0] === '@') {
        let method: string
        let args: Parameter[]
        const targetStart = trimOffset
        const targetEnd = trimOffset + 1

        if (parenPos === -1) {
            method = text.slice(1)
            args = []
        } else {
            method = text.slice(1, parenPos).trim()
            args = parseParameters(_extractArgs(text, parenPos), trimOffset + parenPos + 1)
        }

        return {
            type: 'FunctionCall',
            target: { type: 'GlobalTarget', start: targetStart, end: targetEnd },
            method,
            args,
            isHashMethod: method.startsWith('#'),
            start: trimOffset,
            end: trimOffset + text.length,
        }
    }

    // '*' prefix: indirect / dereference
    if (text[0] === '*') {
        return _parsePrefixedStar(text, parenPos, trimOffset)
    }

    // No parens and no caret -> bare value, delegate to parseParameter.
    // This correctly handles: `1234`, `TRUE`, `"hello"`, `obj|field`, etc.
    if (parenPos === -1 && !text.includes('^')) {
        return parseParameter(text, trimOffset)
    }

    // Has caret but no parens -> function call with no args (e.g. `obj^method`)
    if (parenPos === -1) {
        const [objRef, method] = _splitObjectMethod(text, trimOffset)
        const target: ObjectTarget | null = objRef
            ? { type: 'ObjectTarget', ref: objRef, start: objRef.start, end: objRef.end }
            : null
        return {
            type: 'FunctionCall',
            target,
            method,
            args: [],
            isHashMethod: false,
            start: trimOffset,
            end: trimOffset + text.length,
        }
    }

    const callTarget = text.slice(0, parenPos).trim()
    const argsText = _extractArgs(text, parenPos)
    const [objRef, method] = _splitObjectMethod(callTarget, trimOffset)
    const target: ObjectTarget | null = objRef
        ? { type: 'ObjectTarget', ref: objRef, start: objRef.start, end: objRef.end }
        : null

    return {
        type: 'FunctionCall',
        target,
        method,
        args: parseParameters(argsText, trimOffset + parenPos + 1),
        isHashMethod: method.startsWith('#'),
        start: trimOffset,
        end: trimOffset + text.length,
    }
}

/**
 * Split a comma-separated parameter string respecting `(` / `)` depth.
 *
 * Mirrors `CMC_Behaviour::resolveParameters`.
 */
export function parseParameters(text: string, offset = 0): Parameter[] {
    const originalText = text
    text = text.trim()
    if (!text) return []

    const trimOffset = offset + (originalText.length - originalText.trimStart().length)
    const params: Parameter[] = []
    let depth = 0
    let start = 0

    for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === '(') depth++
        else if (ch === ')') depth--
        else if (ch === ',' && depth === 0) {
            const part = text.slice(start, i).trim()
            if (part) {
                const partStart = trimOffset + text.indexOf(part, start)
                params.push(parseParameter(part, partStart))
            }
            start = i + 1
        }
    }

    const part = text.slice(start).trim()
    if (part) {
        const partStart = trimOffset + text.indexOf(part, start)
        params.push(parseParameter(part, partStart))
    }
    return params
}

/**
 * Classify and parse a single parameter expression.
 *
 * Mirrors `CMC_Behaviour::resolveParameter` priority chain:
 *   1. `[expr]`              -> BracketExpression (parsed as flat Expression)
 *   2. `CONV...`             -> ConversionCall
 *   3. has `^`, no `"`       -> nested FunctionCall (recursive runLine)
 *   4. starts with `"`       -> StringLiteral
 *   5. starts with `-`/digit -> NumberLiteral
 *   6. contains `|`          -> FieldAccess
 *   7. fallback              -> Identifier
 */
export function parseParameter(text: string, offset = 0): Parameter {
    const originalText = text
    text = text.trim()
    const trimOffset = offset + originalText.indexOf(text)

    if (!text) throw new ParseError('empty parameter')

    const first = text[0]

    // 1. bracket expression [...] -> parsed via CMC_Expression
    if (first === '[') {
        let inner = text.slice(1)
        if (inner.endsWith(']')) inner = inner.slice(0, -1)
        const raw = inner.trim()
        const expression = parseExpression(raw, trimOffset, 0)
        return {
            type: 'BracketExpression',
            raw,
            expression,
            start: trimOffset,
            end: trimOffset + text.length,
        }
    }

    // 2. CONV prefix
    if (text.toUpperCase().startsWith('CONV')) {
        return {
            type: 'ConversionCall',
            text,
            start: trimOffset,
            end: trimOffset + text.length,
        }
    }

    // 3. contains '^' and does NOT start with '"' -> nested call
    if (text.includes('^') && first !== '"') {
        return parseLine(text, trimOffset)
    }

    if (first === '"') {
        let value = text.slice(1)
        if (value.endsWith('"')) value = value.slice(0, -1)
        return {
            type: 'StringLiteral',
            value,
            start: trimOffset,
            end: trimOffset + text.length,
        }
    }

    if (first === '-' || (first >= '0' && first <= '9')) {
        return {
            type: 'NumberLiteral',
            value: text,
            start: trimOffset,
            end: trimOffset + text.length,
        }
    }

    const pipe = text.indexOf('|')
    if (pipe !== -1) {
        return {
            type: 'FieldAccess',
            objectName: text.slice(0, pipe).trim(),
            fieldName: text.slice(pipe + 1).trim(),
            start: trimOffset,
            end: trimOffset + text.length,
        }
    }

    if (text === 'TRUE' || text === 'FALSE') {
        return {
            type: 'BooleanLiteral',
            value: valueAsBool(text),
            start: trimOffset,
            end: trimOffset + text.length,
        }
    }

    return {
        type: 'Identifier',
        name: text,
        start: trimOffset,
        end: trimOffset + text.length,
    }
}

export function parseExpression(text: string, trimOffset: number, offset: number = 0): Expression {
    const parts = splitExpression(text, offset)

    // parts[0] is always the first operand (may be empty string for leading operator)
    const headPart = parts[0]
    const head = parseParameter(headPart.text.trim(), trimOffset + 1 + headPart.start)

    const tail: ExprStep[] = []

    for (let i = 1; i + 1 < parts.length; i += 2) {
        const opPart = parts[i]
        const resolved = resolveOp(opPart.text)
        if (!resolved) {
            // Unknown operator - shouldn't happen with well-formed input,
            // but mirror the engine's behaviour of passing through
            continue
        }

        const operandPart = parts[i + 1]
        const operandText = operandPart.text.trim()
        const operandStart = operandPart.start + (operandPart.text.length - operandPart.text.trimStart().length)

        tail.push({
            op: resolved.op,
            opCode: resolved.code,
            operand: parseParameter(operandText, trimOffset + 1 + operandStart),
            start: opPart.start,
            end: operandPart.end,
        })
    }

    return {
        type: 'Expression',
        head,
        tail,
        start: offset,
        end: offset + text.length,
    }
}

function splitExpression(text: string, offset: number = 0): Array<{ text: string; start: number; end: number }> {
    const parts: Array<{ text: string; start: number; end: number }> = []
    let start = 0
    let bracketDepth = 0

    for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === '[') {
            bracketDepth++
        } else if (ch === ']') {
            bracketDepth--
        } else if (bracketDepth === 0 && OPERATOR_CHARS.includes(ch)) {
            // Found an operator at the top level
            parts.push({
                text: text.slice(start, i),
                start: offset + start,
                end: offset + i,
            }) // operand before this operator
            parts.push({
                text: ch,
                start: offset + i,
                end: offset + i + 1,
            }) // the operator character
            start = i + 1
        }
    }

    // Final operand (or the whole string if no operators found)
    parts.push({
        text: text.slice(start),
        start: offset + start,
        end: offset + text.length,
    })
    return parts
}

function resolveOp(text: string): { op: ExprOp; code: number } | null {
    const trimmed = text.trim()

    // symbol form
    const bySymbol = EXPR_OP_SYMBOL[trimmed]
    if (bySymbol) {
        return { op: bySymbol, code: EXPR_OP_CODE[bySymbol] }
    }

    // word form
    const upper = trimmed.toUpperCase()
    if (upper in EXPR_OP_CODE) {
        const op = upper as ExprOp
        return { op, code: EXPR_OP_CODE[op] }
    }

    return null
}

function _parsePrefixedStar(text: string, parenPos: number, offset: number): FunctionCall {
    if (parenPos === -1) {
        const inner = text.slice(1).trim()
        const innerStart = offset + text.indexOf(inner)
        const [objRef, method] = _splitObjectMethod(inner, innerStart)

        if (objRef !== null) {
            const indirect: IndirectRef = {
                type: 'IndirectRef',
                inner: _refToParam(objRef),
                start: offset,
                end: offset + text.length,
            }
            return {
                type: 'FunctionCall',
                target: { type: 'ObjectTarget', ref: indirect, start: offset, end: innerStart + inner.length },
                method,
                args: [],
                isHashMethod: false,
                start: offset,
                end: offset + text.length,
            }
        }

        return {
            type: 'FunctionCall',
            target: {
                type: 'ObjectTarget',
                ref: {
                    type: 'IndirectRef',
                    inner: { type: 'Identifier', name: inner, start: innerStart, end: innerStart + inner.length },
                    start: offset,
                    end: offset + text.length,
                },
                start: offset,
                end: innerStart + inner.length,
            },
            method: inner,
            args: [],
            isHashMethod: false,
            start: offset,
            end: offset + text.length,
        }
    }

    const callTarget = text.slice(1, parenPos).trim()
    const callTargetStart = offset + 1
    const argsText = _extractArgs(text, parenPos)
    const [objRef, method] = _splitObjectMethod(callTarget, callTargetStart)

    let target: ObjectTarget
    if (objRef !== null) {
        target = {
            type: 'ObjectTarget',
            ref: {
                type: 'IndirectRef',
                inner: _refToParam(objRef),
                start: offset,
                end: callTargetStart + callTarget.length,
            },
            start: offset,
            end: callTargetStart + callTarget.length,
        }
    } else {
        target = {
            type: 'ObjectTarget',
            ref: {
                type: 'IndirectRef',
                inner: {
                    type: 'Identifier',
                    name: callTarget,
                    start: callTargetStart,
                    end: callTargetStart + callTarget.length,
                },
                start: offset,
                end: callTargetStart + callTarget.length,
            },
            start: offset,
            end: callTargetStart + callTarget.length,
        }
    }

    return {
        type: 'FunctionCall',
        target,
        method,
        args: parseParameters(argsText, offset + parenPos + 1),
        isHashMethod: method.startsWith('#'),
        start: offset,
        end: offset + text.length,
    }
}

function _splitObjectMethod(text: string, offset: number): [ObjectRef | null, string] {
    const firstCaret = text.indexOf('^')
    const lastCaret = text.lastIndexOf('^')

    if (firstCaret < 1) {
        const method = lastCaret >= 0 ? text.slice(lastCaret + 1) : text
        return [null, method]
    }

    const objCode = text.slice(0, firstCaret)
    const method = text.slice(lastCaret + 1)

    if (objCode.startsWith('#') && objCode.length >= 2) {
        const idByte = objCode.length >= 3 ? objCode.charCodeAt(2) & 0x7f : objCode.charCodeAt(1) & 0x7f
        return [{ type: 'DirectRef', idByte, start: offset, end: offset + objCode.length }, method]
    }

    if (objCode === 'THIS') {
        return [{ type: 'ThisRef', start: offset, end: offset + objCode.length }, method]
    }

    return [{ type: 'Identifier', name: objCode, start: offset, end: offset + objCode.length }, method]
}

function _refToParam(ref: ObjectRef): Parameter {
    switch (ref.type) {
        case 'Identifier':
            return ref
        case 'ThisRef':
            return { type: 'Identifier', name: 'THIS', start: ref.start, end: ref.end }
        case 'DirectRef':
            return { type: 'Identifier', name: `#${ref.idByte}`, start: ref.start, end: ref.end }
        default:
            return { type: 'Identifier', name: String(ref), start: (ref as any).start, end: (ref as any).end }
    }
}

function _extractArgs(text: string, parenPos: number): string {
    let rest = text.slice(parenPos + 1).trim()
    if (rest.endsWith(')')) {
        rest = rest.slice(0, -1)
    }
    return rest.trim()
}

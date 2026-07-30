import { ParseError, parseParameter } from '../parser'
import { CompareOp, Condition, ConditionExpr, LogicOp } from './ast'

/**
 * Parse a logical condition expression like:
 *   `VARSITEMON'"TARGET"||VARSITEMON^FIND("GOTO_")>-1`
 *
 * Supports:
 *   - Comparison operators: ' (eq), !' (ne), < (lt), <' (le), > (gt), >' (ge), ? (has)
 *   - Logical operators: && (and), || (or)
 *
 * The original engine does NOT support mixed && and || in the same
 * expression. It uses whichever operator is found first and splits on that.
 */
export function parseLogicExpression(text: string, offset: number = 0): ConditionExpr {
    const originalText = text
    text = text.trim()
    const trimOffset = offset + originalText.indexOf(text)

    if (!text) {
        throw new ParseError('empty logic expression', text)
    }

    // Find logical operators (respecting parentheses and quotes)
    const andIndex = _findLogicOperator(text, '&&')
    const orIndex = _findLogicOperator(text, '||')

    // Check if we have compound expression
    const hasAnd = andIndex !== -1
    const hasOr = orIndex !== -1

    if (!hasAnd && !hasOr) {
        // Simple condition, no logical operators
        return _parseCondition(text, trimOffset)
    }

    // Determine which operator to use (whichever appears first, or only one present)
    let logicOp: LogicOp
    let operatorStr: string

    if (hasAnd && (!hasOr || andIndex < orIndex)) {
        logicOp = 'AND'
        operatorStr = '&&'
    } else {
        logicOp = 'OR'
        operatorStr = '||'
    }

    // Split by the chosen operator
    const parts = _splitByLogicOperator(text, operatorStr)
    const conditions: Condition[] = []

    let currentOffset = trimOffset
    for (const part of parts) {
        const trimmedPart = part.trim()
        if (!trimmedPart) continue

        const partStart = trimOffset + text.indexOf(trimmedPart, currentOffset - trimOffset)
        conditions.push(_parseCondition(trimmedPart, partStart))
        currentOffset = partStart + trimmedPart.length
    }

    if (conditions.length === 1) {
        return conditions[0]
    }

    return {
        type: 'LogicExpression',
        operator: logicOp,
        conditions,
        start: trimOffset,
        end: trimOffset + text.length,
    }
}

/**
 * Find a logical operator in text, respecting parentheses and quotes.
 */
function _findLogicOperator(text: string, operator: string): number {
    let parenDepth = 0
    let inQuotes = false

    for (let i = 0; i < text.length - (operator.length - 1); i++) {
        const ch = text[i]

        if (ch === '"' && (i === 0 || text[i - 1] !== '\\')) {
            inQuotes = !inQuotes
            continue
        }

        if (inQuotes) continue

        if (ch === '(') {
            parenDepth++
        } else if (ch === ')') {
            parenDepth--
        } else if (parenDepth === 0) {
            if (text.slice(i, i + operator.length) === operator) {
                return i
            }
        }
    }

    return -1
}

/**
 * Split text by a logical operator, respecting parentheses and quotes.
 */
function _splitByLogicOperator(text: string, operator: string): string[] {
    const parts: string[] = []
    let parenDepth = 0
    let inQuotes = false
    let start = 0

    for (let i = 0; i < text.length; i++) {
        const ch = text[i]

        if (ch === '"' && (i === 0 || text[i - 1] !== '\\')) {
            inQuotes = !inQuotes
            continue
        }

        if (inQuotes) continue

        if (ch === '(') {
            parenDepth++
        } else if (ch === ')') {
            parenDepth--
        } else if (parenDepth === 0) {
            if (text.slice(i, i + operator.length) === operator) {
                parts.push(text.slice(start, i))
                start = i + operator.length
            }
        }
    }

    parts.push(text.slice(start))
    return parts
}

/**
 * Parse a single condition like `VARSITEMON'"TARGET"`.
 *
 * Operator detection priority (matching original engine):
 *   1. Find `'` → check char before for `!`, `<`, `>`
 *   2. Find `<` alone
 *   3. Find `>` alone
 *   4. Find `?`
 */
function _parseCondition(text: string, offset: number): Condition {
    const originalText = text
    text = text.trim()
    const trimOffset = offset + originalText.indexOf(text)

    const result = _findComparisonOperator(text)
    if (!result) {
        throw new ParseError('no comparison operator found', text, trimOffset)
    }

    const { operatorIndex, operatorLength, operator } = result

    // Extract left and right operands
    const leftText = text.slice(0, operatorIndex).trim()
    const rightText = text.slice(operatorIndex + operatorLength).trim()

    if (!leftText) {
        throw new ParseError('missing left operand', text, trimOffset)
    }

    if (!rightText) {
        throw new ParseError('missing right operand', text, trimOffset + operatorIndex + operatorLength)
    }

    const leftStart = trimOffset + text.indexOf(leftText)
    const rightStart = trimOffset + text.indexOf(rightText, operatorIndex + operatorLength)

    return {
        type: 'Condition',
        left: parseParameter(leftText, leftStart),
        operator,
        right: parseParameter(rightText, rightStart),
        start: trimOffset,
        end: trimOffset + text.length,
    }
}

/**
 * Find the comparison operator in a condition string.
 *
 * Returns the operator info or null if not found.
 *
 * Detection order matches the original CMC_Condition::valid:
 *   1. Find `'` and check preceding char for compound operators
 *   2. Find standalone `<`
 *   3. Find standalone `>`
 *   4. Find `?`
 */
function _findComparisonOperator(
    text: string
): { operatorIndex: number; operatorLength: number; operator: CompareOp } | null {
    // Search for operators outside of quotes and parentheses
    let parenDepth = 0
    let inQuotes = false

    // First pass: look for apostrophe-based operators
    for (let i = 0; i < text.length; i++) {
        const ch = text[i]

        if (ch === '"' && (i === 0 || text[i - 1] !== '\\')) {
            inQuotes = !inQuotes
            continue
        }

        if (inQuotes) continue

        if (ch === '(') {
            parenDepth++
        } else if (ch === ')') {
            parenDepth--
        } else if (parenDepth === 0 && ch === "'") {
            // Found apostrophe - check preceding character
            if (i > 0) {
                const prevChar = text[i - 1]
                if (prevChar === '!') {
                    return { operatorIndex: i - 1, operatorLength: 2, operator: 'NE' }
                }
                if (prevChar === '<') {
                    return { operatorIndex: i - 1, operatorLength: 2, operator: 'LE' }
                }
                if (prevChar === '>') {
                    return { operatorIndex: i - 1, operatorLength: 2, operator: 'GE' }
                }
            }
            // Plain apostrophe = equals
            return { operatorIndex: i, operatorLength: 1, operator: 'EQ' }
        }
    }

    // Second pass: look for standalone < > ?
    parenDepth = 0
    inQuotes = false

    for (let i = 0; i < text.length; i++) {
        const ch = text[i]

        if (ch === '"' && (i === 0 || text[i - 1] !== '\\')) {
            inQuotes = !inQuotes
            continue
        }

        if (inQuotes) continue

        if (ch === '(') {
            parenDepth++
        } else if (ch === ')') {
            parenDepth--
        } else if (parenDepth === 0) {
            // Check for < but not <' (already handled above)
            if (ch === '<' && (i + 1 >= text.length || text[i + 1] !== "'")) {
                return { operatorIndex: i, operatorLength: 1, operator: 'LT' }
            }
            // Check for > but not >' (already handled above)
            if (ch === '>' && (i + 1 >= text.length || text[i + 1] !== "'")) {
                return { operatorIndex: i, operatorLength: 1, operator: 'GT' }
            }
            if (ch === '?') {
                return { operatorIndex: i, operatorLength: 1, operator: 'HAS' }
            }
        }
    }

    return null
}

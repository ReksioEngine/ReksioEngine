import { Parameter } from '../ast'

/**
 * Comparison operator for conditions.
 *
 * Syntax in condition strings:
 *   '   -> EQ  (equals)
 *   !'  -> NE  (not equals)
 *   <   -> LT  (less than)
 *   <'  -> LE  (less than or equal)
 *   >   -> GT  (greater than)
 *   >'  -> GE  (greater than or equal)
 *   ?   -> HAS (contains/exists)
 */
export type CompareOp = 'EQ' | 'NE' | 'LT' | 'LE' | 'GT' | 'GE' | 'HAS'
export type LogicOp = 'AND' | 'OR'

/**
 * A single comparison condition: `left op right`
 *
 * Examples:
 *   - `VARSITEMON'"TARGET"`  -> VARSITEMON EQ "TARGET"
 *   - `count>-1`             -> count GT -1
 */
export interface Condition {
    type: 'Condition'
    left: Parameter
    operator: CompareOp
    right: Parameter
    start: number
    end: number
}

/**
 * Compound logical expression with && or ||.
 *
 * The original engine does NOT support mixed operators or precedence.
 * A single expression uses either all && or all ||.
 *
 * Example: `A'1 && B'2 && C'3` -> AND of three conditions
 * Example: `A'1 || B'2`        -> OR of two conditions
 */
export interface LogicExpression {
    type: 'LogicExpression'
    operator: LogicOp
    conditions: Condition[]
    start: number
    end: number
}

export type ConditionExpr = Condition | LogicExpression

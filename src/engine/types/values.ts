import { ValueType } from './index'
import { Engine } from '../index'
import { Integer } from './integer'
import { Double } from './double'
import { String as CMCString } from './string'
import { Bool } from './bool'
import { Expression } from './expression'
import { valueAsDouble, valueAsString } from '../../common/types'
import type { CompareOp } from '../../interpreter/expression/ast'
import type { ExprOp } from '../../interpreter/ast'

export type Value = ValueType<any, any> | null

// Temporary values have no name and no parent, so they are never saved to or loaded from the INI
export const createInteger = (engine: Engine, value: number) =>
    new Integer(engine, null, { TYPE: 'INTEGER', NAME: '', VALUE: value } as any)

export const createDouble = (engine: Engine, value: number) =>
    new Double(engine, null, { TYPE: 'DOUBLE', NAME: '', VALUE: value } as any)

export const createString = (engine: Engine, value: string) =>
    new CMCString(engine, null, { TYPE: 'STRING', NAME: '', VALUE: value } as any)

export const createBool = (engine: Engine, value: boolean) =>
    new Bool(engine, null, { TYPE: 'BOOL', NAME: '', VALUE: value } as any)

// Turns an engine value into the primitive that methods of the types expect
export const unwrapValue = async (value: any): Promise<any> => {
    if (value instanceof ValueType) {
        return await value.getValue()
    }
    return value
}

// The values that can be stored on their own, such as in an ARRAY
export type ScalarValue = Integer | Double | CMCString | Bool

export const rawValue = (value: ScalarValue | null) => (value === null ? null : value.getValue())

// A temporary copy that keeps the type, so that changing the variable later doesn't change the copy. NULL stays null.
export const copyValue = async (engine: Engine, value: Value): Promise<ScalarValue | null> => {
    if (value === null) {
        return null
    }
    if (value instanceof Integer) {
        return createInteger(engine, value.getValue())
    }
    if (value instanceof Double) {
        return createDouble(engine, value.getValue())
    }
    if (value instanceof CMCString) {
        return createString(engine, value.getValue())
    }
    if (value instanceof Bool) {
        return createBool(engine, value.getValue())
    }
    // An EXPRESSION is evaluated once, when it is copied. Its result is already a new value.
    if (value instanceof Expression) {
        return await value.evaluate()
    }
    throw new TypeError(`Cannot store a value of type ${value.definition.TYPE}`)
}

export const compareValues = async (engine: Engine, left: Value, op: CompareOp, right: Value): Promise<boolean> => {
    // NULL compares as the string "NULL"
    const leftValue = left ?? createString(engine, 'NULL')
    const rightValue = right ?? createString(engine, 'NULL')

    switch (op) {
        case 'EQ':
            return await leftValue.equals(rightValue)
        case 'NE':
            return !(await leftValue.equals(rightValue))
        case 'LT':
            return valueAsDouble(await unwrapValue(left)) < valueAsDouble(await unwrapValue(right))
        case 'LE':
            return valueAsDouble(await unwrapValue(left)) <= valueAsDouble(await unwrapValue(right))
        case 'GT':
            return valueAsDouble(await unwrapValue(left)) > valueAsDouble(await unwrapValue(right))
        case 'GE':
            return valueAsDouble(await unwrapValue(left)) >= valueAsDouble(await unwrapValue(right))
        case 'HAS':
            return valueAsString(await unwrapValue(left)).includes(valueAsString(await unwrapValue(right)))
    }
}

const calculate = (a: number, op: ExprOp, b: number) => {
    switch (op) {
        case 'ADD':
            return a + b
        case 'SUB':
            return a - b
        case 'MUL':
            return a * b
        case 'DIV':
            return a / b
        case 'MOD':
            return a % b
    }
}

// The type of the result follows the left operand. Always returns a new value, so a variable used as
// the left operand is never changed.
export const applyArithmetic = async (engine: Engine, left: Value, op: ExprOp, right: Value): Promise<ScalarValue> => {
    const leftValue = await unwrapValue(left)
    const rightValue = await unwrapValue(right)

    if (left instanceof Integer) {
        return createInteger(engine, Math.trunc(calculate(valueAsDouble(leftValue), op, valueAsDouble(rightValue))))
    }
    if (left instanceof Bool) {
        if (right instanceof Bool) {
            return createBool(engine, false)
        }
        return createBool(engine, leftValue)
    }
    if (left instanceof Double) {
        return createDouble(engine, calculate(leftValue, op, valueAsDouble(rightValue)))
    }
    if (op === 'ADD') {
        return createString(engine, valueAsString(leftValue) + valueAsString(rightValue))
    }
    return createDouble(engine, calculate(valueAsDouble(leftValue), op, valueAsDouble(rightValue)))
}

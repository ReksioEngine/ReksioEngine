import {assert} from './errors'

export const valueAsString = (value: any) => {
    if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE'
    }
    if (value === null) {
        return 'NULL'
    }
    return value.toString()
}

export const ForceNumber = (value: any) => {
    const numberValue = Number(value)
    assert(!isNaN(numberValue), `${value} is not a number`)
    return numberValue
}

export const Compare = {
    Equal: (a: any, b: any) => {
        return valueAsString(a) == valueAsString(b)
    },
    NotEqual: (a: any, b: any) => {
        return valueAsString(a) != valueAsString(b)
    },
    Less: (a: any, b: any) => {
        return ForceNumber(a) < ForceNumber(b)
    },
    Greater: (a: any, b: any) => {
        return ForceNumber(a) > ForceNumber(b)
    },
    LessOrEqual: (a: any, b: any) => {
        return ForceNumber(a) <= ForceNumber(b)
    },
    GreaterOrEqual: (a: any, b: any) => {
        return ForceNumber(a) >= ForceNumber(b)
    }
}
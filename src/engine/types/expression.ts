import {ValueType} from './index'
import {ExpressionDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../errors'

export class Expression extends ValueType<ExpressionDefinition> {
    constructor(engine: Engine, definition: ExpressionDefinition) {
        super(engine, definition)
    }

    get value() {
        const operand1 = this.engine.executeCallback(this, this.definition.OPERAND1)
        const operand2 = this.engine.executeCallback(this, this.definition.OPERAND2)

        let result
        switch (this.definition.OPERATOR) {
        case 'ADD':
            result = operand1 + operand2
            break
        case 'SUB':
            result = operand1 - operand2
            break
        case 'MUL':
            result = operand1 * operand2
            break
        case 'DIV':
            result = operand1 / operand2
            break
        case 'MOD':
            result = operand1 % operand2
            break
        default:
            throw new NotImplementedError()
        }

        return result
    }
}

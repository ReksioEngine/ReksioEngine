import { Type, ValueType } from './index'
import { ExpressionDefinition } from '../../fileFormats/cnv/types'
import { NotImplementedError } from '../../common/errors'
import { Engine } from '../index'

export class Expression extends ValueType<ExpressionDefinition, boolean> {
    constructor(engine: Engine, parent: Type<any> | null, definition: ExpressionDefinition) {
        super(engine, parent, definition, false)
    }

    async getValue() {
        const operand1 = await this.engine.scripting.executeCallback(this, this.definition.OPERAND1)
        const operand2 = await this.engine.scripting.executeCallback(this, this.definition.OPERAND2)

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

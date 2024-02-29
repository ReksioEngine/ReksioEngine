import {Type} from './index'
import {ConditionDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {InterruptScriptExecution} from '../../interpreter/evaluator'

export class Condition extends Type<ConditionDefinition> {
    constructor(engine: Engine, definition: ConditionDefinition) {
        super(engine, definition)
    }

    // arg is always true in ReksioIUfo
    BREAK(arg: boolean) {
        if (this.CHECK(arg)) {
            throw new InterruptScriptExecution()
        }
    }

    // arg is always true in ReksioIUfo
    ONE_BREAK(arg: boolean) {
        if (this.CHECK(arg)) {
            throw new InterruptScriptExecution()
        }
    }

    CHECK(arg: boolean): boolean {
        const operand1 = this.engine.executeCallback(this, this.definition.OPERAND1)
        const operand2 = this.engine.executeCallback(this, this.definition.OPERAND2)

        switch (this.definition.OPERATOR) {
        case 'EQUAL':
            return operand1 == operand2
        case 'NOTEQUAL':
            return operand1 != operand2
        case 'LESS':
            return operand1 < operand2
        case 'GREATER':
            return operand1 > operand2
        case 'LESSEQUAL':
            return operand1 <= operand2
        case 'GREATEREQUAL':
            return operand1 >= operand2
        }
    }
}

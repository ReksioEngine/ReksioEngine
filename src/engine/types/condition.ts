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
        const operand1 = this.engine.executeCallback(this, this, this.definition.OPERAND1)
        const operand2 = this.engine.executeCallback(this, this, this.definition.OPERAND2)

        let result
        switch (this.definition.OPERATOR) {
        case 'EQUAL':
            result = operand1 == operand2
            break
        case 'NOTEQUAL':
            result = operand1 != operand2
            break
        case 'LESS':
            result = operand1 < operand2
            break
        case 'GREATER':
            result = operand1 > operand2
            break
        case 'LESSEQUAL':
            result = operand1 <= operand2
            break
        case 'GREATEREQUAL':
            result = operand1 >= operand2
            break
        }

        if (this.definition.ONRUNTIMESUCCESS && result) {
            this.engine.executeCallback(this, this, this.definition.ONRUNTIMESUCCESS)
        } else if (this.definition.ONRUNTIMEFAILED && !result) {
            this.engine.executeCallback(this, this, this.definition.ONRUNTIMEFAILED)
        }

        return result
    }
}

import {Type} from './index'
import {ConditionDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {InterruptScriptExecution} from '../../interpreter/evaluator'
import {Compare} from '../../types'

export class Condition extends Type<ConditionDefinition> {
    constructor(engine: Engine, definition: ConditionDefinition) {
        super(engine, definition)
        this.callbacks.register('ONRUNTIMESUCCESS', this.definition.ONRUNTIMESUCCESS)
        this.callbacks.register('ONRUNTIMEFAILED', this.definition.ONRUNTIMEFAILED)
    }

    // arg is always true in ReksioIUfo
    // In loops its like 'break'
    BREAK(arg: boolean) {
        if (this.CHECK(arg)) {
            throw new InterruptScriptExecution(false)
        }
    }

    // arg is always true in ReksioIUfo
    // In loops its like 'continue'
    ONE_BREAK(arg: boolean) {
        if (this.CHECK(arg)) {
            throw new InterruptScriptExecution(true)
        }
    }

    CHECK(arg: boolean): boolean {
        // valueAsString() in order to achieve loose equality
        const operand1 = this.engine.executeCallback(this, this.definition.OPERAND1)
        const operand2 = this.engine.executeCallback(this, this.definition.OPERAND2)

        let result
        switch (this.definition.OPERATOR) {
        case 'EQUAL':
            result = Compare.Equal(operand1, operand2)
            break
        case 'NOTEQUAL':
            result = Compare.NotEqual(operand1, operand2)
            break
        case 'LESS':
            result = Compare.Less(operand1, operand2)
            break
        case 'GREATER':
            result = Compare.Greater(operand1, operand2)
            break
        case 'LESSEQUAL':
            result = Compare.LessOrEqual(operand1, operand2)
            break
        case 'GREATEREQUAL':
            result = Compare.GreaterOrEqual(operand1, operand2)
            break
        }

        if (result) {
            this.callbacks.run('ONRUNTIMESUCCESS')
        } else {
            this.callbacks.run('ONRUNTIMEFAILED')
        }

        return result
    }
}

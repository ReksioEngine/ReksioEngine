import {Type} from './index'
import {ConditionDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {InterruptScriptExecution} from '../../interpreter/evaluator'
import {CodeSource} from '../debugging'

export class Condition extends Type<ConditionDefinition> {
    constructor(engine: Engine, definition: ConditionDefinition) {
        super(engine, definition)
        this.callbacks.register('ONRUNTIMESUCCESS', this.definition.ONRUNTIMESUCCESS)
        this.callbacks.register('ONRUNTIMEFAILED', this.definition.ONRUNTIMEFAILED)
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
        const operand1 = this.engine.executeCallback(this, new CodeSource(this, 'OPERAND1'), this.definition.OPERAND1)
        const operand2 = this.engine.executeCallback(this, new CodeSource(this, 'OPERAND2'), this.definition.OPERAND2)

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

        if (result) {
            this.callbacks.run('ONRUNTIMESUCCESS')
        } else {
            this.callbacks.run('ONRUNTIMEFAILED')
        }

        return result
    }
}

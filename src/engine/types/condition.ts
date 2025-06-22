import { Type } from './index'
import { ConditionDefinition } from '../../fileFormats/cnv/types'
import { InterruptScriptExecution } from '../../interpreter/script'
import { Compare, method } from '../../common/types'
import { UnexpectedError } from '../../common/errors'

export class Condition extends Type<ConditionDefinition> {
    // arg is always true in ReksioIUfo
    // In loops its like 'break'
    @method()
    BREAK(arg: boolean) {
        if (this.CHECK(arg)) {
            throw new InterruptScriptExecution(false)
        }
    }

    // arg is always true in ReksioIUfo
    // In loops its like 'continue'
    @method()
    ONE_BREAK(arg: boolean) {
        if (this.CHECK(arg)) {
            throw new InterruptScriptExecution(true)
        }
    }

    @method()
    CHECK(shouldSignal: boolean): boolean {
        const operand1 = this.engine.scripting.executeCallback(null, this.definition.OPERAND1)
        const operand2 = this.engine.scripting.executeCallback(null, this.definition.OPERAND2)

        let result
        if (operand1 !== undefined && operand2 !== undefined) {
            try {
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
            } catch (err) {
                if (err instanceof UnexpectedError) {
                    console.error(
                        'Condition details\n' + '\n' + '%cCondition:%c%O\n%cOperand1:%c%O\n%cOperand2:%c%O\n',
                        'font-weight: bold',
                        'font-weight: inherit',
                        this,
                        'font-weight: bold',
                        'font-weight: inherit',
                        operand1,
                        'font-weight: bold',
                        'font-weight: inherit',
                        operand2
                    )
                }
                throw err
            }
        } else {
            result = false
            console.warn(`Condition ${this.name} has an operand that resolved to undefined. operand1=${operand1}, operand2=${operand2}`)
        }

        if (shouldSignal) {
            if (result) {
                this.callbacks.run('ONRUNTIMESUCCESS', null, null)
            } else {
                this.callbacks.run('ONRUNTIMEFAILED', null, null)
            }
        }

        return result
    }
}

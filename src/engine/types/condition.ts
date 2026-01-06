import { Type } from './index'
import { ConditionDefinition } from '../../fileFormats/cnv/types'
import { InterruptScriptExecution } from '../../interpreter/script'
import { Compare, method } from '../../common/types'
import { logger } from '../logging'

export class Condition extends Type<ConditionDefinition> {
    // arg is always true in ReksioIUfo
    // In loops its like 'break'
    @method()
    async BREAK(arg: boolean) {
        if (await this.CHECK(arg)) {
            throw new InterruptScriptExecution(false)
        }
    }

    // arg is always true in ReksioIUfo
    // In loops its like 'continue'
    @method()
    async ONE_BREAK(arg: boolean) {
        if (await this.CHECK(arg)) {
            throw new InterruptScriptExecution(true)
        }
    }

    @method()
    async CHECK(shouldSignal: boolean): Promise<boolean> {
        const operand1 = await this.engine.scripting.executeCallback(null, this, this.definition.OPERAND1)
        const operand2 = await this.engine.scripting.executeCallback(null, this, this.definition.OPERAND2)

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
                logger.error(
                    'Error occured while evaluating condition',
                    {
                        condition: this,
                    },
                    err
                )
                throw err
            }
        } else {
            result = false
            logger.warn(
                `Condition ${this.name} has an operand that resolved to undefined. operand1=${operand1}, operand2=${operand2}`,
                {
                    condition: this,
                }
            )
        }

        if (shouldSignal) {
            if (result) {
                await this.callbacks.run('ONRUNTIMESUCCESS', null, null)
            } else {
                await this.callbacks.run('ONRUNTIMEFAILED', null, null)
            }
        }

        return result
    }
}

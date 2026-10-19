import { Type } from './index'
import { ConditionDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'
import { logger } from '../logging'
import { assert, InterruptScriptExecution } from '../../common/errors'
import { compareValues } from './values'
import type { CompareOp } from '../../interpreter/expression/ast'

const OPERATORS: Record<string, CompareOp> = {
    EQUAL: 'EQ',
    NOTEQUAL: 'NE',
    LESS: 'LT',
    GREATER: 'GT',
    LESSEQUAL: 'LE',
    GREATEREQUAL: 'GE',
}

export class Condition extends Type<ConditionDefinition> {
    // arg is always true in ReksioIUfo
    // In loops its like 'break'
    @method()
    async BREAK(arg: boolean) {
        if (await this.check(arg)) {
            throw new InterruptScriptExecution(false)
        }
    }

    // arg is always true in ReksioIUfo
    // In loops its like 'continue'
    @method()
    async ONE_BREAK(arg: boolean) {
        if (await this.check(arg)) {
            throw new InterruptScriptExecution(true)
        }
    }

    @method()
    async CHECK(shouldSignal: boolean): Promise<boolean> {
        return await this.check(shouldSignal)
    }

    async check(shouldSignal: boolean): Promise<boolean> {
        const operand1 = await this.engine.scripting.executeCallback(null, this, this.definition.OPERAND1)
        const operand2 = await this.engine.scripting.executeCallback(null, this, this.definition.OPERAND2)

        let result
        if (operand1 !== undefined && operand2 !== undefined) {
            const operator = OPERATORS[this.definition.OPERATOR]
            assert(operator !== undefined, 'Unknown operator')
            try {
                result = await compareValues(this.engine, operand1, operator, operand2)
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

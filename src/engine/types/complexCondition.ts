import { Type } from './index'
import { ComplexConditionDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'
import { Condition } from './condition'
import { assert, InterruptScriptExecution } from '../../common/errors'

export class ComplexCondition extends Type<ComplexConditionDefinition> {
    // In loops its like 'break'
    @method()
    async BREAK(arg: boolean) {
        if (await this.CHECK(arg)) {
            throw new InterruptScriptExecution(false)
        }
    }

    // In loops its like 'continue'
    @method()
    async ONE_BREAK(arg: boolean) {
        if (await this.CHECK(arg)) {
            throw new InterruptScriptExecution(true)
        }
    }

    @method()
    async CHECK(arg: boolean): Promise<boolean> {
        const condition1 = this.getObject<Condition>(this.definition.CONDITION1)
        const condition2 = this.getObject<Condition>(this.definition.CONDITION2)
        assert(condition1 !== null && condition2 !== null)

        let result
        switch (this.definition.OPERATOR) {
            case 'AND':
                result = (await condition1.CHECK(arg)) && (await condition2.CHECK(arg))
                break
            case 'OR':
                result = (await condition1.CHECK(arg)) || (await condition2.CHECK(arg))
                break
        }

        if (result) {
            await this.callbacks.run('ONRUNTIMESUCCESS')
        } else {
            await this.callbacks.run('ONRUNTIMEFAILED')
        }

        return result
    }
}

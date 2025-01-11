import { Type } from './index'
import { ComplexConditionDefinition } from '../../fileFormats/cnv/types'
import { InterruptScriptExecution } from '../../interpreter/script/evaluator'
import { method } from '../../types'

export class ComplexCondition extends Type<ComplexConditionDefinition> {
    // In loops its like 'break'
    @method()
    BREAK(arg: boolean) {
        if (this.CHECK(arg)) {
            throw new InterruptScriptExecution(false)
        }
    }

    // In loops its like 'continue'
    @method()
    ONE_BREAK(arg: boolean) {
        if (this.CHECK(arg)) {
            throw new InterruptScriptExecution(true)
        }
    }

    @method()
    CHECK(arg: boolean): boolean {
        const condition1 = this.engine.getObject(this.definition.CONDITION1)
        const condition2 = this.engine.getObject(this.definition.CONDITION2)

        let result
        switch (this.definition.OPERATOR) {
            case 'AND':
                result = condition1.CHECK(arg) && condition2.CHECK(arg)
                break
            case 'OR':
                result = condition1.CHECK(arg) || condition2.CHECK(arg)
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

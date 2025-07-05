import { Type } from './index'
import { ComplexConditionDefinition } from '../../fileFormats/cnv/types'
import { InterruptScriptExecution } from '../../interpreter/script'
import { method } from '../../common/types'

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
            await this.callbacks.run('ONRUNTIMESUCCESS')
        } else {
            await this.callbacks.run('ONRUNTIMEFAILED')
        }

        return result
    }
}

import {Type} from './index'
import {ComplexConditionDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'

export class ComplexCondition extends Type<ComplexConditionDefinition> {
    constructor(engine: Engine, definition: ComplexConditionDefinition) {
        super(engine, definition)
        this.callbacks.register('ONRUNTIMESUCCESS', this.definition.ONRUNTIMESUCCESS)
        this.callbacks.register('ONRUNTIMEFAILED', this.definition.ONRUNTIMEFAILED)
    }

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

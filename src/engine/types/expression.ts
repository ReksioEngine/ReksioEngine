import { ParentType, ValueType } from './index'
import { ExpressionDefinition } from '../../fileFormats/cnv/types'
import { NotImplementedError } from '../../common/errors'
import { Engine } from '../index'
import { applyArithmetic, unwrapValue } from './values'
import type { ExprOp } from '../../interpreter'

const OPERATORS: string[] = ['ADD', 'SUB', 'MUL', 'DIV', 'MOD']

export class Expression extends ValueType<ExpressionDefinition, boolean> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: ExpressionDefinition) {
        super(engine, parent, definition, false)
    }

    async getValue() {
        return await unwrapValue(await this.evaluate())
    }

    async toString(): Promise<string> {
        return (await this.evaluate()).toString()
    }

    async evaluate() {
        const operand1 = await this.engine.scripting.executeCallback(this, this, this.definition.OPERAND1)
        const operand2 = await this.engine.scripting.executeCallback(this, this, this.definition.OPERAND2)

        const operator = this.definition.OPERATOR
        if (!OPERATORS.includes(operator)) {
            throw new NotImplementedError()
        }

        return await applyArithmetic(this.engine, operand1 ?? null, operator as ExprOp, operand2 ?? null)
    }
}

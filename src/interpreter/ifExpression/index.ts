import ReksioIFExpressionVisitor from './ReksioIFExpressionVisitor'
import antlr4 from 'antlr4'
import ReksioIFExpressionParser, {
    ExprContext,
    ExprListContext,
    IdentifierContext,
    LogicOperatorContext,
    NumberContext,
    StringContext,
} from './ReksioIFExpressionParser'
import ReksioIFExpressionLexer from './ReksioIFExpressionLexer'
import { ForceNumber } from '../../common/types'
import { Engine } from '../../engine'
import { Type, ValueType } from '../../engine/types'
import { assert } from '../../common/errors'

export class ExpressionEvaluator extends ReksioIFExpressionVisitor<any> {
    constructor(
        private engine: Engine,
        private caller: Type<any> | null
    ) {
        super()
    }

    visitExprList = async (ctx: ExprListContext): Promise<any> => {
        const subResults = []
        for (const entry of this.visitChildren(ctx)) {
            const value = await entry
            if (value !== undefined) {
                subResults.push(value)
            }
        }

        let result = subResults[0]
        for (let i = 1; i < subResults.length - 1; i += 2) {
            const operator = subResults[i]
            const nextValue = subResults[i + 1]

            if (operator === '&&') {
                result = result && nextValue
            } else if (operator === '||') {
                result = result || nextValue
            }
        }

        return result
    }

    visitExpr = async (ctx: ExprContext): Promise<any> => {
        const left = await this.visit(ctx._left)[0]
        const right = await this.visit(ctx._right)[0]

        if (ctx._operator.type == ReksioIFExpressionParser.EQUAL) {
            return left == right
        } else if (ctx._operator.type == ReksioIFExpressionParser.NOT_EQUAL) {
            return left != right
        } else if (ctx._operator.type == ReksioIFExpressionParser.GREATER) {
            return left > right
        } else if (ctx._operator.type == ReksioIFExpressionParser.SMALLER) {
            return left < right
        } else if (ctx._operator.type == ReksioIFExpressionParser.GREATER_EQUAL) {
            return left >= right
        } else if (ctx._operator.type == ReksioIFExpressionParser.SMALLER_EQUAL) {
            return left <= right
        }
    }

    visitString = (ctx: StringContext): any => {
        return ctx.STRING().getText().replace(/^"|"$/g, '')
    }

    visitNumber = (ctx: NumberContext): any => {
        return ForceNumber(ctx.getText())
    }

    visitIdentifier = async (ctx: IdentifierContext): Promise<any> => {
        const object: ValueType<any, any> | null = this.engine.getObject(ctx.getText(), this.caller?.parentScope)
        assert(object !== null)
        return await object.getValue()
    }

    visitLogicOperator = (ctx: LogicOperatorContext): any => {
        return ctx.getText()
    }
}

export const evaluateExpression = async (engine: Engine, caller: Type<any> | null, script: string) => {
    const lexer = new ReksioIFExpressionLexer(new antlr4.CharStream(script))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioIFExpressionParser(tokens)
    const tree = parser.exprList()

    const evaluator = new ExpressionEvaluator(engine, caller)
    return await tree.accept(evaluator)
}

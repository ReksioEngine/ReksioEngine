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

export class ExpressionEvaluator extends ReksioIFExpressionVisitor<any> {
    private engine: Engine

    constructor(engine: Engine) {
        super()
        this.engine = engine
    }

    visitExprList = (ctx: ExprListContext): any => {
        const subResults = this.visitChildren(ctx).filter((x: any) => x !== undefined)

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

    visitExpr = (ctx: ExprContext): any => {
        const left = this.visit(ctx._left)[0]
        const right = this.visit(ctx._right)[0]

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

    visitIdentifier = (ctx: IdentifierContext): any => {
        const object = this.engine.getObject(ctx.getText())
        return object.value
    }

    visitLogicOperator = (ctx: LogicOperatorContext): any => {
        return ctx.getText()
    }
}

export const evaluateExpression = (engine: Engine, script: string) => {
    const lexer = new ReksioIFExpressionLexer(new antlr4.CharStream(script))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioIFExpressionParser(tokens)
    const tree = parser.exprList()

    const evaluator = new ExpressionEvaluator(engine)
    return tree.accept(evaluator)
}

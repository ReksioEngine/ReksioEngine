import ReksioLangVisitor from './ReksioLangVisitor'
import ReksioLangParser, {
    ExprContext,
    MethodCallArgumentsContext,
    MethodCallContext, ObjectNameContext, OperationContext, OperationGroupingContext, SpecialCallContext,
    StatementContext,
    StatementListContext
} from './ReksioLangParser'
import ReksioLangLexer from './ReksioLangLexer'
import antlr4, {ParserRuleContext} from 'antlr4'
import {Type} from '../engine/types'

class ExecutionError extends Error {
    constructor(ctx: ParserRuleContext, msg: string) {
        super(msg)
    }
}

export class ScriptEvaluator extends ReksioLangVisitor<any> {
    private readonly scope: Record<string, any>
    private readonly objectContext: Type<any> | null

    constructor(objectContext: Type<any> | null, scope: Record<string, any>) {
        super()
        this.scope = scope
        this.objectContext = objectContext
    }

    visitStatementList = (ctx: StatementListContext): any => {
        ctx.statement_list().forEach(statement => {
            this.visitStatement(statement)
        })
    }

    visitStatement = (ctx: StatementContext): any => {
        return this.visit(ctx.expr())
    }

    visitExpr = (ctx: ExprContext): any => {
        if (ctx.TRUE() != null) {
            return true
        } else if (ctx.FALSE() != null) {
            return false
        } else if (ctx.NUMBER() != null) {
            return Number(ctx.NUMBER().getText())
        } else if (ctx.negativeNumber() != null) {
            return Number(ctx.negativeNumber().getText())
        } else if (ctx.STRING() != null) {
            return ctx.STRING().getText().replace(/^"|"$/g, '')
        }

        return this.visitChildren(ctx)[0]
    }

    visitMethodCall = (ctx: MethodCallContext): any => {
        const object = this.visitObjectName(ctx.objectName())

        const methodName = ctx.methodName().getText()
        const method = object[methodName]
        if (method == undefined) {
            throw new ExecutionError(ctx, `Unknown method ${ctx.getText()}`)
        }

        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : []
        return method.bind(object)(...args)
    }

    visitSpecialCall = (ctx: SpecialCallContext): any => {
        const methodName = ctx.methodName().getText()
        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : []

        this.scope['_'][methodName].apply([this.objectContext, ...args])
    }

    visitMethodCallArguments = (ctx: MethodCallArgumentsContext): any => {
        return ctx.expr_list().map(expr => this.visitExpr(expr))
    }

    visitObjectName = (ctx: ObjectNameContext): any => {
        if (!Object.prototype.hasOwnProperty.call(this.scope, ctx.getText())) {
            throw new ExecutionError(ctx, `Unknown identifier '${ctx.getText()}'`)
        }

        return this.scope[ctx.getText()]
    }

    visitOperationGrouping = (ctx: OperationGroupingContext): any => {
        return this.visitOperation(ctx.operation())
    }

    visitOperation = (ctx: OperationContext): any => {
        if (ctx.expr() != null) {
            return this.visitExpr(ctx.expr())
        }

        const left = this.visitOperation(ctx._left)
        const right = this.visitOperation(ctx._right)

        if (ctx._operator.type == ReksioLangParser.ADD) {
            return left + right
        } else if (ctx._operator.type == ReksioLangParser.SUB) {
            return left - right
        } else if (ctx._operator.type == ReksioLangParser.MUL) {
            return left * right
        } else if (ctx._operator.type == ReksioLangParser.MOD) {
            return left % right
        } else if (ctx._operator.type == ReksioLangParser.DIV) {
            return left / right
        }
    }
}

export const runScript = (objectContext: Type<any> | null, scope: object, script: string) => {
    const lexer = new ReksioLangLexer(new antlr4.CharStream(script))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioLangParser(tokens)
    const tree = parser.statementList()
    tree.accept(new ScriptEvaluator(objectContext, scope))
}

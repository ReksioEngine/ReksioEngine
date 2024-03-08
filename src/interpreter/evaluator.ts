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
import {NotImplementedError} from '../utils'
import {Engine} from '../engine'

class ExecutionError extends Error {
    constructor(ctx: ParserRuleContext, msg: string) {
        super(msg)
    }
}

export class InterruptScriptExecution {}

export class ScriptEvaluator extends ReksioLangVisitor<any> {
    private readonly engine: Engine

    constructor(engine: Engine) {
        super()
        this.engine = engine
    }

    visitStatementList = (ctx: StatementListContext): any => {
        let result = null
        ctx.statement_list().forEach(statement => {
            result = this.visitStatement(statement)
        })
        return result
    }

    visitStatement = (ctx: StatementContext): any => {
        if (ctx.expr() == null) {
            return
        }
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
        } else if (ctx.IDENTIFIER() != null) {
            const object = this.engine.getObject(ctx.IDENTIFIER().getText())
            if (object === undefined) {
                // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
                console.error(`Unknown identifier '${ctx.getText()}'`)
                return null
            }
            return object.value
        }

        return this.visitChildren(ctx)[0]
    }

    visitMethodCall = (ctx: MethodCallContext): any => {
        const object = this.visitObjectName(ctx.objectName())
        if (object == undefined) {
            return
        }

        const methodName = ctx.methodName().getText()
        const method = object[methodName]
        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : []

        if (method == undefined) {
            return object.__unknown_method(methodName, args)
        }

        try {
            return method.bind(object)(...args)
        } catch (err) {
            if (err instanceof NotImplementedError) {
                console.error(err)
                return null
            }
            throw err
        }
    }

    visitSpecialCall = (ctx: SpecialCallContext): any => {
        const methodName = ctx.methodName().getText()
        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : []

        // this.scope['_'][methodName].apply([this.objectContext, ...args])
    }

    visitMethodCallArguments = (ctx: MethodCallArgumentsContext): any => {
        return ctx.expr_list().map(expr => this.visitExpr(expr))
    }

    visitObjectName = (ctx: ObjectNameContext): any => {
        const object = this.engine.getObject(ctx.getText())
        if (object === undefined) {
            // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
            console.error(`Unknown identifier '${ctx.getText()}'`)
            return null
        }

        return object
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

export const runScript = (engine: Engine, script: string, singleStatement: boolean = false) => {
    const lexer = new ReksioLangLexer(new antlr4.CharStream(script))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioLangParser(tokens)
    const tree = singleStatement ? parser.statement() : parser.statementList()

    try {
        return tree.accept(new ScriptEvaluator(engine))
    } catch (err) {
        if (err instanceof InterruptScriptExecution) {
            return
        }

        console.error('Error occurred while executing following script:\n' + script)
        console.error('Scope:', engine.scope)
        throw err
    }
}

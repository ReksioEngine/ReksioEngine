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
import {Engine} from '../engine'
import {RandomLibrary} from './stdlib'
import {Behaviour} from '../engine/types/behaviour'
import {NotImplementedError} from '../errors'
import {valueAsString} from '../utils'

export class InterruptScriptExecution {
    public one: boolean
    constructor(one: boolean = false) {
        this.one = one
    }
}

class AlreadyDisplayedError {
    public cause: any
    constructor(cause: any) {
        this.cause = cause
    }
}

export class ScriptEvaluator extends ReksioLangVisitor<any> {
    private readonly engine?: Engine
    private readonly args?: any[]
    private readonly script?: string

    public lastContext: ParserRuleContext | null = null
    public methodCallUsedVariables: any = {}
    public scriptUsedVariables: any = {}

    private libraries = new Map<string, any>()

    constructor(engine?: Engine, script?: string, args?: any[]) {
        super()
        this.engine = engine
        this.script = script
        this.args = args
        this.loadLibraries()
    }

    private loadLibraries() {
        this.libraries.set('RANDOM', new RandomLibrary(this.engine))
    }

    visitStatementList = (ctx: StatementListContext): any => {
        this.lastContext = ctx
        let result = null
        ctx.statement_list().forEach(statement => {
            result = this.visitStatement(statement)
        })
        return result
    }

    visitStatement = (ctx: StatementContext): any => {
        this.lastContext = ctx
        if (ctx.expr() == null) {
            return
        }
        return this.visit(ctx.expr())
    }

    visitExpr = (ctx: ExprContext): any => {
        this.lastContext = ctx
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
            const identifier = ctx.IDENTIFIER().getText()
            if (identifier.startsWith('$') && this.args) {
                const argIdx = parseInt(identifier.substring(1)) - 1
                this.methodCallUsedVariables[identifier] = this.args[argIdx]
                this.scriptUsedVariables[identifier] = this.args[argIdx]
                return this.args[argIdx]
            }

            const object = this.engine?.getObject(ctx.IDENTIFIER().getText())
            this.methodCallUsedVariables[identifier] = object
            this.scriptUsedVariables[identifier] = object
            if (object === undefined) {
                const code = this.markInCode(ctx)
                console.error(
                    'Unknown identifier\n' +
                    '\n' +
                    `%cCode:%c\n${code}`,
                    '%cUsed variables:%c%O',
                    'font-weight: bold', 'font-weight: inherit',
                    'color: red', 'color: inherit',
                    'font-weight: bold', 'font-weight: inherit', this.scriptUsedVariables
                )

                // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
                return null
            }
            return object.value
        }

        return this.visitChildren(ctx)[0]
    }

    visitMethodCall = (ctx: MethodCallContext): any => {
        this.lastContext = ctx
        const object = this.visitObjectName(ctx.objectName())
        if (object == undefined) {
            return
        }

        const methodName = ctx.methodName().getText()
        const method = object[methodName]

        this.methodCallUsedVariables = {}
        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : []
        const argsVariables = this.methodCallUsedVariables
        this.methodCallUsedVariables = {}

        try {
            if (method == undefined) {
                return object.__call(methodName, args)
            }

            const savedThis = this.engine?.getObject('THIS')
            const result = method.bind(object)(...args)

            if (savedThis !== undefined) {
                this.engine!.scope['THIS'] = savedThis
            }

            return result === null ? 'NULL' : result
        } catch (err) {
            if (err instanceof InterruptScriptExecution) {
                throw err
            }

            const code = this.markInCode(ctx)
            console.error(
                'Error occurred during method call\n' +
                '\n' +
                `%cCode:%c\n${code}` +
                '\n' +
                '%cObject:%c %O\n' +
                (args.length > 0 ? '%cArguments:%c %O\n' : '') +
                (this.args?.length ? '%cBehaviour Arguments:%c %O\n' : '') +
                (Object.keys(argsVariables).length > 0 ? '%cVariables used in call:%c %O\n' : '') +
                (Object.keys(this.scriptUsedVariables).length > 0 ? '%cVariables used in script:%c %O\n' : '') +
                '%cScope:%c %O\n',
                'font-weight: bold', 'font-weight: inherit',
                'color: red', 'color: inherit',
                'font-weight: bold', 'font-weight: inherit', object,
                ...(args.length > 0 ? ['font-weight: bold', 'font-weight: inherit', args] : []),
                ...(this.args?.length ? ['font-weight: bold', 'font-weight: inherit', this.args] : []),
                ...(Object.keys(argsVariables).length > 0 ? ['font-weight: bold', 'font-weight: inherit', argsVariables] : []),
                ...(Object.keys(this.scriptUsedVariables).length > 0 ? ['font-weight: bold', 'font-weight: inherit', this.scriptUsedVariables] : []),
                'font-weight: bold', 'font-weight: inherit', this.engine?.scope,
            )
            console.error(err)

            if (err instanceof NotImplementedError) {
                return null
            }

            // eslint-disable-next-line no-debugger
            debugger

            throw new AlreadyDisplayedError(err)
        }
    }

    visitSpecialCall = (ctx: SpecialCallContext) => {
        this.lastContext = ctx
        const methodName = ctx.methodName().getText()
        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : []

        if (methodName === 'IF') {
            const operator = args[1]

            // valueAsString() in order to achieve loose equality
            const left = valueAsString(this.engine?.getObject(args[0])?.value ?? args[0])
            const right = valueAsString(this.engine?.getObject(args[2])?.value ?? args[2])

            let result = false
            if (operator == '_') {
                result = left === right
            } else if (operator == '!_') {
                result = left !== right
            }

            const onTrue: Behaviour | undefined = this.engine?.getObject(args[3])
            const onFalse: Behaviour | undefined = this.engine?.getObject(args[4])

            if (result && onTrue !== undefined) {
                onTrue.RUNC()
            } else if (!result && onFalse !== undefined) {
                onFalse.RUNC()
            }
        } else {
            const code = this.markInCode(ctx)
            console.error(
                `Unknown special call ${methodName}` +
                '\n' +
                `%cCode:%c\n${code}`,
                '%cUsed variables:%c%O',
                'font-weight: bold', 'font-weight: inherit',
                'color: red', 'color: inherit',
                'font-weight: bold', 'font-weight: inherit', this.scriptUsedVariables
            )
            // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
        }
    }

    visitMethodCallArguments = (ctx: MethodCallArgumentsContext): any => {
        this.lastContext = ctx
        return ctx.expr_list().map(expr => this.visitExpr(expr))
    }

    visitObjectName = (ctx: ObjectNameContext): any => {
        this.lastContext = ctx
        const objectName = ctx.getText()

        if (objectName.startsWith('$') && this.args) {
            const argIdx = parseInt(objectName.substring(1)) - 1
            return this.args[argIdx]
        }

        const object = this.engine?.getObject(objectName)
        this.methodCallUsedVariables[objectName] = object
        this.scriptUsedVariables[objectName] = object

        if (object === undefined) {
            if (this.libraries.has(objectName)) {
                return this.libraries.get(objectName)
            }

            const code = this.markInCode(ctx)
            console.error(
                'Unknown identifier\n' +
                '\n' +
                `%cCode:%c\n${code}\n\n` +
                '%cUsed variables:%c %O\n' +
                '%cScope:%c %O\n',
                'font-weight: bold', 'font-weight: inherit',
                'color: red', 'color: inherit',
                'font-weight: bold', 'font-weight: inherit', this.scriptUsedVariables,
                'font-weight: bold', 'font-weight: inherit', this.engine?.scope,
            )

            // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
            return null
        }

        return object
    }

    visitOperationGrouping = (ctx: OperationGroupingContext): any => {
        this.lastContext = ctx
        return this.visitOperation(ctx.operation())
    }

    visitOperation = (ctx: OperationContext): any => {
        this.lastContext = ctx
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

    markInCode(ctx: ParserRuleContext) {
        const code =
            this.script?.substring(0, ctx.start.column) +
            '%c' +
            this.script?.substring(ctx.start.column, ctx.stop!.column + 1) +
            '%c' +
            this.script?.substring(ctx.stop!.column + 1)

        return code.trimEnd().split(';').join(';\n')
    }
}

export const runScript = (engine: Engine, script: string, args?: any[], singleStatement: boolean = false) => {
    const lexer = new ReksioLangLexer(new antlr4.CharStream(script))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioLangParser(tokens)
    const tree = singleStatement ? parser.statement() : parser.statementList()

    const evaluator = new ScriptEvaluator(engine, script, args)
    try {
        return tree.accept(evaluator)
    } catch (err) {
        if (err instanceof InterruptScriptExecution) {
            throw err
        } else if (!(err instanceof AlreadyDisplayedError)) {
            if (evaluator.lastContext) {
                const code = evaluator.markInCode(evaluator.lastContext)
                console.error(
                    'Execution stopped due to irrecoverable error\n\n' +
                    `%cCode:%c\n${code}` +
                    '%cCode source:%c %O',
                    'font-weight: bold', 'font-weight: inherit',
                    'color: red', 'color: inherit',
                )
            }
            console.error(err)
            throw err
        }
    }
}

export const parseArgs = (script: string) => {
    const lexer = new ReksioLangLexer(new antlr4.CharStream(script))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioLangParser(tokens)
    const tree = parser.methodCallArguments()
    return tree.accept(new ScriptEvaluator(undefined, script))
}

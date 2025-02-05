import ReksioLangParserVisitor from './ReksioLangParserVisitor'
import ReksioLangParser, {
    BoolContext,
    ExprContext,
    IdentifierContext,
    MethodCallArgumentsContext,
    MethodCallContext,
    NumberContext,
    ObjectNameContext,
    OperationContext,
    OperationGroupingContext,
    SpecialCallContext,
    StatementContext,
    StatementListContext,
    StringContext,
} from './ReksioLangParser'
import ReksioLangLexer from './ReksioLangLexer'
import antlr4, { ParserRuleContext, RecognitionException, Recognizer, Token } from 'antlr4'
import { Engine } from '../../engine'
import { Behaviour } from '../../engine/types/behaviour'
import { assert, NotImplementedError } from '../../errors'
import { Compare, ForceNumber, valueAsString } from '../../types'
import { Type } from '../../engine/types'
import { String } from '../../engine/types/string'
import { printStackTrace, StackFrame, stackTrace } from './stacktrace'
import { evaluateExpression } from '../ifExpression/evaluator'
import { Rand } from '../../engine/types/rand'
import { System } from '../../engine/types/system'

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

export class ScriptEvaluator extends ReksioLangParserVisitor<any> {
    private readonly engine: Engine
    private readonly args: any[]
    private readonly script: string
    private readonly printDebug: boolean

    public lastContext: ParserRuleContext | null = null
    public methodCallUsedVariables: any = {}
    public scriptUsedVariables: any = {}

    private globalInstances = new Map<string, any>()

    constructor(engine: Engine, script: string, args: any[], printDebug: boolean = true) {
        super()
        this.engine = engine
        this.script = script
        this.args = args
        this.printDebug = printDebug
        this.loadLibraries()
    }

    private loadLibraries() {
        this.globalInstances.set(
            'RANDOM',
            new Rand(this.engine, null, {
                TYPE: 'RAND',
                NAME: 'RANDOM',
                TOINI: false,
            })
        )
        this.globalInstances.set(
            'SYSTEM',
            new System(this.engine, null, {
                TYPE: 'SYSTEM',
                NAME: 'SYSTEM',
                TOINI: false,
            })
        )
    }

    visitStatementList = (ctx: StatementListContext): any => {
        this.lastContext = ctx
        let result = null
        ctx.statement_list().forEach((statement) => {
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

        if (ctx.comment() != null) {
            return
        }

        return this.visitChildren(ctx)[0]
    }

    visitIdentifier = (ctx: IdentifierContext): any => {
        const identifier = ctx.IDENTIFIER().getText()
        if (identifier.startsWith('$') && this.args) {
            const argIdx = parseInt(identifier.substring(1)) - 1
            assert(this.args.length >= argIdx + 1)

            const arg = this.args[argIdx]

            this.methodCallUsedVariables[identifier] = arg
            this.scriptUsedVariables[identifier] = arg

            if (typeof arg === 'string') {
                const object = this.engine.getObject(arg)
                if (object !== null && object instanceof String) {
                    return object.value
                }
            }

            return this.args[argIdx]
        }

        const object = this.engine.getObject(identifier)
        this.methodCallUsedVariables[identifier] = object
        this.scriptUsedVariables[identifier] = object
        if (object === null) {
            if (this.printDebug) {
                const code = this.markInCode(ctx)
                console.error(
                    'Unknown identifier\n' + '\n' + `%cCode:%c\n${code}\n\n` + '%cUsed variables:%c%O',
                    'font-weight: bold',
                    'font-weight: inherit',
                    'color: red',
                    'color: inherit',
                    'font-weight: bold',
                    'font-weight: inherit',
                    this.scriptUsedVariables
                )
            }

            // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
            return null
        }
        return object.value
    }

    visitBool = (ctx: BoolContext): any => {
        if (ctx.TRUE() != null) {
            return true
        } else if (ctx.FALSE() != null) {
            return false
        }
    }

    visitNumber = (ctx: NumberContext): any => {
        return ForceNumber(ctx.getText())
    }

    visitString = (ctx: StringContext): any => {
        if (ctx.CODE_STRING() != null) {
            return ctx.CODE_STRING().getText().replace(/^"|"$/g, '')
        } else if (ctx.STRING() != null) {
            return this.replaceParameters(ctx.STRING().getText().replace(/^"|"$/g, ''))
        }
    }

    replaceParameters(str: string): string {
        return str.replace(/\$(\d+)/g, (match, index) => {
            const valueIndex = parseInt(index, 10) - 1

            if (valueIndex >= 0 && valueIndex < this.args.length) {
                const arg = this.args[valueIndex]
                if (arg instanceof String) {
                    return arg.value
                } else if (arg instanceof Type) {
                    return arg.name
                } else {
                    return arg
                }
            } else {
                return match
            }
        })
    }

    visitMethodCall = (ctx: MethodCallContext): any => {
        this.lastContext = ctx
        const object = this.visitObjectName(ctx.objectName())
        if (object == null) {
            return
        }

        const methodName = ctx.methodName().getText()
        const method = object[methodName]

        this.methodCallUsedVariables = {}
        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : []
        const argsVariables = this.methodCallUsedVariables
        this.methodCallUsedVariables = {}

        try {
            const stackFrame = StackFrame.builder()
                .type('method')
                .object(object)
                .method(methodName)
                .args(...args)
                .build()
            stackTrace.push(stackFrame)

            if (method == undefined) {
                return object.__call(methodName, args)
            }

            const result = method.bind(object)(...args)
            return result === null ? 'NULL' : result
        } catch (err) {
            if (err instanceof InterruptScriptExecution) {
                throw err
            }

            if (this.printDebug) {
                const code = this.markInCode(ctx)
                console.error(
                    'Error occurred during method call\n' +
                        '\n' +
                        `%cCode:%c\n${code}` +
                        '\n' +
                        '%cObject:%c %O\n' +
                        (args.length > 0 ? '%cArguments:%c %O\n' : '') +
                        (this.args.length ? '%cBehaviour Arguments:%c %O\n' : '') +
                        (Object.keys(argsVariables).length > 0 ? '%cVariables used in call:%c %O\n' : '') +
                        (Object.keys(this.scriptUsedVariables).length > 0 ? '%cVariables used in script:%c %O\n' : '') +
                        '%cScope:%c %O\n',
                    'font-weight: bold',
                    'font-weight: inherit',
                    'color: red',
                    'color: inherit',
                    'font-weight: bold',
                    'font-weight: inherit',
                    object,
                    ...(args.length > 0 ? ['font-weight: bold', 'font-weight: inherit', args] : []),
                    ...(this.args.length ? ['font-weight: bold', 'font-weight: inherit', this.args] : []),
                    ...(Object.keys(argsVariables).length > 0
                        ? ['font-weight: bold', 'font-weight: inherit', argsVariables]
                        : []),
                    ...(Object.keys(this.scriptUsedVariables).length > 0
                        ? ['font-weight: bold', 'font-weight: inherit', this.scriptUsedVariables]
                        : []),
                    'font-weight: bold',
                    'font-weight: inherit',
                    this.engine.scope
                )
                console.error(err)
                printStackTrace()
            }

            if (err instanceof NotImplementedError) {
                return null
            }

            // eslint-disable-next-line no-debugger
            debugger

            throw new AlreadyDisplayedError(err)
        } finally {
            stackTrace.pop()
        }
    }

    visitSpecialCall = (ctx: SpecialCallContext) => {
        this.lastContext = ctx
        const methodName = ctx.methodName().getText()
        const args = ctx.methodCallArguments() != null ? this.visitMethodCallArguments(ctx.methodCallArguments()) : []

        if (methodName === 'IF') {
            if (args.length == 5) {
                const [a, operator, b, ifTrue, ifFalse] = args
                const left = this.engine.getObject(valueAsString(a))?.value ?? a
                const right = this.engine.getObject(valueAsString(b))?.value ?? b

                let result = false
                if (operator == '_') {
                    result = Compare.Equal(left, right)
                } else if (operator == '!_') {
                    result = Compare.NotEqual(left, right)
                } else if (operator == '>') {
                    result = Compare.Greater(left, right)
                } else if (operator == '<') {
                    result = Compare.Less(left, right)
                } else if (operator == '>_') {
                    result = Compare.GreaterOrEqual(left, right)
                } else if (operator == '<_') {
                    result = Compare.LessOrEqual(left, right)
                }

                const onTrue: Behaviour | null = this.engine.getObject(ifTrue)
                const onFalse: Behaviour | null = this.engine.getObject(ifFalse)

                if (result && onTrue !== null) {
                    onTrue.RUNC()
                } else if (!result && onFalse !== null) {
                    onFalse.RUNC()
                }
            } else if (args.length == 3) {
                const [expression, ifTrue, ifFalse] = args
                const result = evaluateExpression(this.engine, expression)
                const onTrue: Behaviour | null = this.engine.getObject(ifTrue)
                const onFalse: Behaviour | null = this.engine.getObject(ifFalse)

                if (result && onTrue !== null) {
                    onTrue.RUNC()
                } else if (!result && onFalse !== null) {
                    onFalse.RUNC()
                }
            }
        } else if (methodName === 'BREAK') {
            throw new InterruptScriptExecution(false)
        } else if (this.printDebug) {
            const code = this.markInCode(ctx)
            console.error(
                `Unknown special call ${methodName}` + '\n' + `%cCode:%c\n${code}\n\n` + '%cUsed variables:%c%O',
                'font-weight: bold',
                'font-weight: inherit',
                'color: red',
                'color: inherit',
                'font-weight: bold',
                'font-weight: inherit',
                this.scriptUsedVariables
            )
            // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
        }
    }

    visitMethodCallArguments = (ctx: MethodCallArgumentsContext): any => {
        this.lastContext = ctx
        return ctx.expr_list().map((expr) => this.visitExpr(expr))
    }

    visitObjectName = (ctx: ObjectNameContext): any => {
        this.lastContext = ctx

        const objectName = this.replaceParameters(ctx.getText())
        const object = this.engine.getObject(objectName)
        this.methodCallUsedVariables[objectName] = object
        this.scriptUsedVariables[objectName] = object

        if (object === null) {
            if (this.globalInstances.has(objectName)) {
                return this.globalInstances.get(objectName)
            }

            if (this.printDebug) {
                const code = this.markInCode(ctx)
                console.error(
                    'Unknown identifier\n' +
                        '\n' +
                        `%cCode:%c\n${code}\n\n` +
                        '%cUsed variables:%c %O\n' +
                        '%cScope:%c %O\n',
                    'font-weight: bold',
                    'font-weight: inherit',
                    'color: red',
                    'color: inherit',
                    'font-weight: bold',
                    'font-weight: inherit',
                    this.scriptUsedVariables,
                    'font-weight: bold',
                    'font-weight: inherit',
                    this.engine.scope
                )
            }

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
        const left = this.visitExpr(ctx._left)
        let right = this.visitExpr(ctx._right)

        // It was a problem in S71_DROGA (Ufo)
        if (typeof left === 'number' && typeof right === 'string') {
            right = ForceNumber(right)
        }

        let result = undefined
        if (ctx._operator.type == ReksioLangParser.ADD) {
            result = left + right
        } else if (ctx._operator.type == ReksioLangParser.SUB) {
            result = left - right
        } else if (ctx._operator.type == ReksioLangParser.MUL) {
            result = left * right
        } else if (ctx._operator.type == ReksioLangParser.MOD) {
            result = left % right
        } else if (ctx._operator.type == ReksioLangParser.DIV) {
            result = left / right
        }

        assert(!(typeof result == 'number' && isNaN(result)))
        return result
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

export const runScript = (
    engine: Engine,
    script: string,
    args: any[] = [],
    singleStatement: boolean = false,
    printDebug = true
) => {
    const initialLexer = new ReksioLangLexer(new antlr4.CharStream(script))
    initialLexer.removeErrorListeners()

    const initialTokens = new antlr4.CommonTokenStream(initialLexer)
    initialTokens.fill()

    // Fix simple typos in scripts
    const rewriter = new antlr4.TokenStreamRewriter(initialTokens)
    for (const token of initialTokens.tokens) {
        if (token.type === ReksioLangLexer.TYPO && token.text === ':') {
            rewriter.replaceSingle(token, ';')
        } else if (token.type === ReksioLangLexer.TYPO && token.text === '>') {
            rewriter.replaceSingle(token, '^')
        } else if (token.type === ReksioLangLexer.TYPO_QUOTE) {
            const nextToken = initialTokens.get(token.tokenIndex + 1)
            rewriter.replace(token, nextToken, `"${nextToken.text}"`)
        } else if (token.type === ReksioLangLexer.EOF) {
            const prevToken = initialTokens.get(token.tokenIndex - 1)
            if (prevToken.type !== ReksioLangLexer.STATEMENT_END) {
                rewriter.insertAfter(prevToken, ';')
            }
        }
    }

    const lexer = new ReksioLangLexer(new antlr4.CharStream(rewriter.getText()))
    lexer.removeErrorListeners()
    lexer.addErrorListener({
        syntaxError(
            _recognizer: Recognizer<number>,
            _offendingSymbol: number,
            line: number,
            column: number,
            msg: string
        ) {
            console.error(`Lexer error: ${msg} at ${line}:${column}\n${script}`)
            printStackTrace()
        },
    })

    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioLangParser(tokens)
    parser.removeErrorListeners()
    parser.addErrorListener({
        syntaxError(
            _recognizer: Recognizer<Token>,
            _offendingSymbol: Token,
            line: number,
            column: number,
            msg: string,
            _e: RecognitionException | undefined
        ) {
            console.error(`Parser error: ${msg} at ${line}:${column}\n${script}`)
            printStackTrace()
        },
    })

    const tree = singleStatement ? parser.statement() : parser.statementList()
    const evaluator = new ScriptEvaluator(engine, script, args, printDebug)
    try {
        return tree.accept(evaluator)
    } catch (err) {
        if (err instanceof InterruptScriptExecution) {
            throw err
        } else if (!(err instanceof AlreadyDisplayedError)) {
            if (evaluator.lastContext) {
                const code = evaluator.markInCode(evaluator.lastContext)

                if (printDebug) {
                    console.error(
                        'Execution stopped due to irrecoverable error\n\n' + `%cCode:%c\n${code}`,
                        'font-weight: bold',
                        'font-weight: inherit',
                        'color: red',
                        'color: inherit'
                    )
                }
            }
            if (printDebug) {
                console.error(err)
            }
            throw err
        }
    }
}

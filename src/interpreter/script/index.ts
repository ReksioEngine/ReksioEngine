import ReksioLangParserVisitor from './ReksioLangParserVisitor'
import ReksioLangParser, {
    BoolContext,
    ExprContext,
    IdentifierContext,
    MethodCallArgumentsContext,
    MethodCallContext,
    NumberContext,
    ObjectNameContext,
    ObjectValueReferenceContext,
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
import { assert, IgnorableError, IrrecoverableError, NotImplementedError } from '../../common/errors'
import { Compare, ForceNumber, valueAsString } from '../../common/types'
import { Type, ValueType } from '../../engine/types'
import { String } from '../../engine/types/string'
import { printStackTrace, StackFrame, stackTrace } from './stacktrace'
import { evaluateExpression } from '../ifExpression'
import { Rand } from '../../engine/types/rand'
import { System } from '../../engine/types/system'
import { createCallback, reference } from '../../fileFormats/common'
import { Integer } from '../../engine/types/integer'
import { Struct } from '../../engine/types/struct'
import { CNVLoader } from '../../engine/types/cnvloader'

export class InterruptScriptExecution extends IgnorableError {
    public one: boolean
    constructor(one: boolean = false) {
        super()
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
    private readonly caller: Type<any> | null
    private readonly args: any[]
    private readonly script: string
    private readonly printDebug: boolean

    public lastContext: ParserRuleContext | null = null
    public methodCallUsedVariables: any = {}
    public scriptUsedVariables: any = {}

    private globalInstances = new Map<string, any>()

    constructor(engine: Engine, caller: Type<any> | null, script: string, args: any[], printDebug: boolean = true) {
        super()
        this.engine = engine
        this.caller = caller
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
            })
        )
        this.globalInstances.set(
            'SYSTEM',
            new System(this.engine, null, {
                TYPE: 'SYSTEM',
                NAME: 'SYSTEM',
            })
        )
        this.globalInstances.set(
            'CNVLOADER',
            new CNVLoader(this.engine, null, {
                TYPE: 'CNVLOADER',
                NAME: 'CNVLOADER'
            })
        )
    }

    visitStatementList = async (ctx: StatementListContext): Promise<any> => {
        this.lastContext = ctx
        let result = null

        for (const statement of ctx.statement_list()) {
            result = await this.visitStatement(statement)
        }
        return result
    }

    visitStatement = async (ctx: StatementContext): Promise<any> => {
        this.lastContext = ctx
        if (ctx.expr() == null) {
            return
        }
        return await this.visit(ctx.expr())
    }

    visitExpr = async (ctx: ExprContext): Promise<any> => {
        this.lastContext = ctx

        if (ctx.comment() != null) {
            return
        }

        return await this.visitChildren(ctx)[0]
    }

    visitIdentifier = (ctx: IdentifierContext): any => {
        const name = ctx.IDENTIFIER().getText()
        if (ctx._dereference == null) {
            return name
        }

        const object: ValueType<any, any> | null = this.getObject(name)
        if (object != null) {
            return object.getValue()
        }

        return null
    }

    visitObjectValueReference = (ctx: ObjectValueReferenceContext): any => {
        const identifier = ctx.objectName().getText()
        if (identifier == 'NULL') {
            return null
        }

        const object = this.visitObjectName(ctx.objectName())
        this.methodCallUsedVariables[identifier] = object
        this.scriptUsedVariables[identifier] = object
        if (object === null) {
            return identifier
        } else if (object instanceof ValueType) {
            return object.getValue()
        } else {
            return object
        }
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
            return ctx.STRING().getText().replace(/^"|"$/g, '')
        }
    }

    visitMethodCall = async (ctx: MethodCallContext): Promise<any> => {
        this.lastContext = ctx
        const object = this.visitObjectName(ctx.objectName())
        if (object == null) {
            return
        }

        const methodName = ctx.methodName().getText()
        const method = object[methodName]

        this.methodCallUsedVariables = {}
        const args = ctx.methodCallArguments() != null ? await this.visitMethodCallArguments(ctx.methodCallArguments()) : []
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
                return await object.__call(methodName, args)
            }

            const result = await method.bind(object)(...args)
            return result === null ? 'NULL' : result
        } catch (err) {
            if (err instanceof IgnorableError) {
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
                        '%cGlobal scopes:%c %O\n' +
                        '%cCaller scope:%c %O\n',
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
                    this.engine.scopeManager.scopes,
                    'font-weight: bold',
                    'font-weight: inherit',
                    this.caller?.parentScope
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

    async resolveConditionalCall(a: any, operator: string, b: any) {
        const left =
            typeof a === 'string'
                ? a.toString().startsWith('"')
                    ? a.toString().replace(/^"|"$/g, '')
                    : (await this.getObject<ValueType<any, any>>(valueAsString(a))?.getValue() ?? a)
                : a

        const right =
            typeof b === 'string'
                ? b.toString().startsWith('"')
                    ? b.toString().replace(/^"|"$/g, '')
                    : (await this.getObject<ValueType<any, any>>(valueAsString(b))?.getValue() ?? b)
                : b

        if (operator == '_') {
            return Compare.Equal(left, right)
        } else if (operator == '!_') {
            return Compare.NotEqual(left, right)
        } else if (operator == '>') {
            return Compare.Greater(left, right)
        } else if (operator == '<') {
            return Compare.Less(left, right)
        } else if (operator == '>_') {
            return Compare.GreaterOrEqual(left, right)
        } else if (operator == '<_') {
            return Compare.LessOrEqual(left, right)
        }

        assert(false, 'unknown comparison operator')
    }

    visitSpecialCall = async (ctx: SpecialCallContext) => {
        this.lastContext = ctx
        const methodName = ctx.methodName().getText()
        const args = ctx.methodCallArguments() != null ? await this.visitMethodCallArguments(ctx.methodCallArguments()) : []

        const stackFrame = StackFrame.builder()
            .type('specialCall')
            .method(methodName)
            .args(...args)
            .build()
        stackTrace.push(stackFrame)

        try {
            if (methodName === 'IF') {
                if (args.length == 5) {
                    const [a, operator, b, ifTrue, ifFalse] = args

                    const result = await this.resolveConditionalCall(a, operator, b)
                    const onTrue: Behaviour | null = this.getObject(ifTrue)
                    const onFalse: Behaviour | null = this.getObject(ifFalse)

                    if (result && onTrue !== null) {
                        await onTrue.executeConditionalCallback()
                    } else if (!result && onFalse !== null) {
                        await onFalse.executeConditionalCallback()
                    }
                } else if (args.length == 3) {
                    const [expression, ifTrue, ifFalse] = args
                    const result = await evaluateExpression(this.engine, this.caller, expression)
                    const onTrue: Behaviour | null = this.getObject(ifTrue)
                    const onFalse: Behaviour | null = this.getObject(ifFalse)

                    if (result && onTrue !== null) {
                        await onTrue.executeConditionalCallback()
                    } else if (!result && onFalse !== null) {
                        await onFalse.executeConditionalCallback()
                    }
                }
            } else if (methodName === 'BREAK') {
                throw new InterruptScriptExecution(false)
            } else if (methodName === 'LOOP') {
                const [codeOrBehaviour, start, len, step] = args

                const callback = createCallback(codeOrBehaviour)
                if (callback === undefined) {
                    throw new IrrecoverableError('Invalid @LOOP callback')
                }

                const counter = new Integer(this.engine, null, {
                    NAME: '_I_',
                    TYPE: 'INTEGER',
                    TOINI: false,
                })
                for (let i = start; i < start + len; i += step) {
                    await counter.setValue(i)
                    try {
                        await this.engine.scripting.executeCallback(
                            null,
                            this.caller,
                            callback,
                            [],
                            {
                                _I_: counter,
                            },
                            true
                        )
                    } catch (err) {
                        if (err instanceof InterruptScriptExecution) {
                            if (err.one) {
                                continue
                            }
                            break
                        }
                        throw err
                    }
                }
            } else if (methodName === 'WHILE') {
                const [a, operator, b, codeOrBehaviour] = args
                const callback = createCallback(codeOrBehaviour)
                if (callback === undefined) {
                    throw new IrrecoverableError('Invalid callback')
                }

                while (await this.resolveConditionalCall(a, operator, b)) {
                    try {
                        await this.engine.scripting.executeCallback(
                            null,
                            this.caller,
                            callback,
                            [],
                            undefined,
                            true
                        )
                    } catch (err) {
                        if (err instanceof InterruptScriptExecution) {
                            if (err.one) {
                                continue
                            }
                            break
                        }
                        throw err
                    }
                }
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
        } finally {
            stackTrace.pop()
        }
    }

    visitMethodCallArguments = async (ctx: MethodCallArgumentsContext): Promise<any> => {
        this.lastContext = ctx
        return Promise.all(ctx.expr_list().map(async (expr) => await this.visitExpr(expr)))
    }

    visitObjectName = (ctx: ObjectNameContext): any => {
        this.lastContext = ctx

        let objectName = this.visitIdentifier(ctx.identifier())

        const object = this.getObject(objectName)
        this.methodCallUsedVariables[objectName] = object
        this.scriptUsedVariables[objectName] = object

        if (object === null) {
            if (this.globalInstances.has(objectName)) {
                return this.globalInstances.get(objectName)
            }

            if (this.printDebug) {
                const code = this.markInCode(ctx)
                console.error(
                    `Unknown identifier "${objectName}"\n` +
                        '\n' +
                        `%cCode:%c\n${code}\n\n` +
                        '%cUsed variables:%c %O\n' +
                        '%cGlobal scopes:%c %O\n' +
                        '%cCaller scope:%c %O\n',
                    'font-weight: bold',
                    'font-weight: inherit',
                    'color: red',
                    'color: inherit',
                    'font-weight: bold',
                    'font-weight: inherit',
                    this.scriptUsedVariables,
                    'font-weight: bold',
                    'font-weight: inherit',
                    this.engine.scopeManager.scopes,
                    'font-weight: bold',
                    'font-weight: inherit',
                    this.caller?.parentScope
                )
            }

            // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
            return null
        }

        const subField = ctx.subFieldAccess()
        if (subField !== null) {
            assert(object instanceof Struct)
            const struct = object as Struct
            const subFieldValue = struct.GETFIELD(subField.IDENTIFIER().getText())
            this.methodCallUsedVariables[ctx.getText()] = object
            this.scriptUsedVariables[ctx.getText()] = object
            return subFieldValue
        }

        return object
    }

    visitOperationGrouping = async (ctx: OperationGroupingContext): Promise<any> => {
        this.lastContext = ctx
        return this.visitOperation(ctx.operation())
    }

    visitOperation = async (ctx: OperationContext): Promise<any> => {
        this.lastContext = ctx
        if (ctx.expr() !== null) {
            return this.visitExpr(ctx.expr())
        }

        const left = await this.visitOperation(ctx._left)
        let right = await this.visitOperation(ctx._right)

        // It was a problem in S71_DROGA (Ufo)
        if (typeof left === 'number' && typeof right === 'string') {
            right = ForceNumber(right)
        }

        let result = undefined
        if (ctx._operator.type == ReksioLangParser.PLUS) {
            result = left + right
        } else if (ctx._operator.type == ReksioLangParser.MINUS) {
            result = left - right
        } else if (ctx._operator.type == ReksioLangParser.ASTERISK) {
            result = left * right
        } else if (ctx._operator.type == ReksioLangParser.PERCENTAGE) {
            result = left % right
        } else if (ctx._operator.type == ReksioLangParser.AT) {
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

    getObject<T extends Type<any>>(name: string | reference | null): T | null {
        return this.engine.getObject(name, this.caller?.parentScope)
    }
}

export const runScript = async (
    engine: Engine,
    caller: Type<any> | null,
    script: string,
    args: any[] = [],
    singleStatement: boolean = false,
    printDebug = true
) => {
    script = script.replace(/\$(\d+)/g, (match, index) => {
        const valueIndex = parseInt(index, 10) - 1
        if (valueIndex >= 0 && valueIndex < args.length) {
            const arg = args[valueIndex]
            if (arg instanceof String) {
                return arg.getValue()
            } else if (arg instanceof Type) {
                return arg.name
            } else {
                return arg
            }
        } else {
            return match
        }
    })

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
    const evaluator = new ScriptEvaluator(engine, caller, script, args, printDebug)
    try {
        return await tree.accept(evaluator)
    } catch (err) {
        if (err instanceof IgnorableError) {
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

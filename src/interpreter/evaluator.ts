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
import {assert, NotImplementedError} from '../errors'
import {Compare, ForceNumber, valueAsString} from '../types'
import {Type} from '../engine/types'

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

type StackFrameTypes = 'method' | 'behaviour' | 'callback'

export class StackFrame {
    public type: StackFrameTypes | null = null
    public object: Type<any> | null = null
    public methodName: string | null = null
    public behaviour: string | null = null
    public callback: string | null = null
    public args: any[] | null = null

    static builder() {
        return new StackFrameBuilder()
    }
}

class StackFrameBuilder {
    private stackFrame: StackFrame = new StackFrame()

    type(type: StackFrameTypes) {
        this.stackFrame.type = type
        return this
    }

    object(object: Type<any> | null) {
        this.stackFrame.object = object
        return this
    }

    method(name: string) {
        this.stackFrame.methodName = name
        return this
    }

    behaviour(name: string) {
        this.stackFrame.behaviour = name
        return this
    }

    callback(name: string) {
        this.stackFrame.callback = name
        return this
    }

    args(...args: any[]) {
        this.stackFrame.args = args
        return this
    }

    build() {
        return this.stackFrame
    }
}

export const stackTrace: StackFrame[] = []

export const printStackTrace = () => {
    const lines: string[] = []

    for (const frame of stackTrace) {
        const argsString = (frame.args ?? []).map(arg => arg !== undefined ? valueAsString(arg) : '<undefined>').join(',')

        switch (frame.type) {
        case 'callback':
            lines.push(`at ${frame.object!.name}@${frame.callback}(${argsString})`)
            break
        case 'method':
            lines.push(`at ${frame.object!.name}^${frame.methodName}(${argsString})`)
            break
        case 'behaviour':
            lines.push(`at ${frame.behaviour}(${argsString})`)
            break
        }
    }

    console.error('\t' + lines.join('\n\t'))
}

export class ScriptEvaluator extends ReksioLangVisitor<any> {
    private readonly engine?: Engine
    private readonly args: any[]
    private readonly script?: string
    private readonly printDebug: boolean

    public lastContext: ParserRuleContext | null = null
    public methodCallUsedVariables: any = {}
    public scriptUsedVariables: any = {}

    private libraries = new Map<string, any>()

    constructor(engine?: Engine, script?: string, args?: any[], printDebug?: boolean) {
        super()
        this.engine = engine
        this.script = script
        this.args = args ?? []
        this.printDebug = printDebug ?? true
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
            return ForceNumber(ctx.NUMBER().getText())
        } else if (ctx.negativeNumber() != null) {
            return ForceNumber(ctx.negativeNumber().getText())
        } else if (ctx.STRING() != null) {
            return this.replaceParameters(ctx.STRING().getText().replace(/^"+|"+$/g, ''))
        } else if (ctx.IDENTIFIER() != null) {
            const identifier = ctx.IDENTIFIER().getText()
            if (identifier.startsWith('$') && this.args) {
                const argIdx = parseInt(identifier.substring(1)) - 1
                this.methodCallUsedVariables[identifier] = this.args[argIdx]
                this.scriptUsedVariables[identifier] = this.args[argIdx]

                assert(this.args.length >= argIdx + 1)
                return this.args[argIdx]
            }

            const object = this.engine?.getObject(ctx.IDENTIFIER().getText())
            this.methodCallUsedVariables[identifier] = object
            this.scriptUsedVariables[identifier] = object
            if (object === null) {
                if (this.printDebug) {
                    const code = this.markInCode(ctx)
                    console.error(
                        'Unknown identifier\n' +
                        '\n' +
                        `%cCode:%c\n${code}\n\n` +
                        '%cUsed variables:%c%O',
                        'font-weight: bold', 'font-weight: inherit',
                        'color: red', 'color: inherit',
                        'font-weight: bold', 'font-weight: inherit', this.scriptUsedVariables
                    )
                }

                // Don't stop execution because of games authors mistake in "Reksio i Skarb Piratów"
                return null
            }
            return object.value
        }

        return this.visitChildren(ctx)[0]
    }

    replaceParameters(str: string): string {
        return str.replace(/\$(\d+)/g, (match, index) => {
            const valueIndex = parseInt(index, 10) - 1

            if (valueIndex >= 0 && valueIndex < this.args.length) {
                const arg = this.args[valueIndex]
                if (arg instanceof Type) {
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
                .object(object)
                .method(methodName)
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
                    'font-weight: bold', 'font-weight: inherit',
                    'color: red', 'color: inherit',
                    'font-weight: bold', 'font-weight: inherit', object,
                    ...(args.length > 0 ? ['font-weight: bold', 'font-weight: inherit', args] : []),
                    ...(this.args.length ? ['font-weight: bold', 'font-weight: inherit', this.args] : []),
                    ...(Object.keys(argsVariables).length > 0 ? ['font-weight: bold', 'font-weight: inherit', argsVariables] : []),
                    ...(Object.keys(this.scriptUsedVariables).length > 0 ? ['font-weight: bold', 'font-weight: inherit', this.scriptUsedVariables] : []),
                    'font-weight: bold', 'font-weight: inherit', this.engine?.scope,
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
            const operator = args[1]

            // valueAsString() in order to achieve loose equality
            const left = this.engine?.getObject(args[0])?.value ?? args[0]
            const right = this.engine?.getObject(args[2])?.value ?? args[2]

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

            const onTrue: Behaviour | null = this.engine?.getObject(args[3])
            const onFalse: Behaviour | null = this.engine?.getObject(args[4])

            if (result && onTrue !== null) {
                onTrue.RUNC()
            } else if (!result && onFalse !== null) {
                onFalse.RUNC()
            }
        } else if (this.printDebug) {
            const code = this.markInCode(ctx)
            console.error(
                `Unknown special call ${methodName}` +
                '\n' +
                `%cCode:%c\n${code}\n\n` +
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

        const objectName = this.replaceParameters(ctx.getText())
        const object = this.engine?.getObject(objectName)
        this.methodCallUsedVariables[objectName] = object
        this.scriptUsedVariables[objectName] = object

        if (object === null) {
            if (this.libraries.has(objectName)) {
                return this.libraries.get(objectName)
            }

            if (this.printDebug) {
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
        if (ctx.expr() != null) {
            return this.visitExpr(ctx.expr())
        }

        const left = this.visitOperation(ctx._left)
        let right = this.visitOperation(ctx._right)

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

export const runScript = (engine: Engine, script: string, args?: any[], singleStatement: boolean = false, printDebug = true) => {
    const lexer = new ReksioLangLexer(new antlr4.CharStream(script))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioLangParser(tokens)
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
                        'Execution stopped due to irrecoverable error\n\n' +
                        `%cCode:%c\n${code}`,
                        'font-weight: bold', 'font-weight: inherit',
                        'color: red', 'color: inherit',
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

export const parseArgs = (script: string) => {
    const lexer = new ReksioLangLexer(new antlr4.CharStream(script))
    const tokens = new antlr4.CommonTokenStream(lexer)
    const parser = new ReksioLangParser(tokens)
    const tree = parser.methodCallArguments()
    return tree.accept(new ScriptEvaluator(undefined, script))
}

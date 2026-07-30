import type { FunctionCall, Parameter, Statement, Expression, IndirectRef, ObjectRef } from './ast'
import { Engine } from '../engine'
import { Type, ValueType } from '../engine/types'
import { Struct } from '../engine/types/struct'
import { Compare, ForceNumber, toNumber, valueAsString } from '../common/types'
import { Rand } from '../engine/types/rand'
import { System } from '../engine/types/system'
import { CNVLoader } from '../engine/types/cnvloader'
import { createCallback } from '../fileFormats/common'
import { Behaviour } from '../engine/types/behaviour'
import { IgnorableError, IrrecoverableError, NotImplementedError } from '../common/errors'
import { Integer } from '../engine/types/integer'
import { String as CMCString } from '../engine/types/string'
import { parseCode } from './parser'
import { parseLogicExpression } from './expression'
import { CompareOp, ConditionExpr } from './expression/ast'
import { color, fmt, logger } from '../engine/logging'
import { printStackTrace, StackFrame, stackTrace } from './stacktrace'

export class RuntimeError extends Error {
    constructor(message: string) {
        super(`Runtime error: ${message}`)
        this.name = 'RuntimeError'
    }
}

class SilentError {
    constructor(public readonly cause: unknown) {}
}

export class RuntimeContext {
    constructor(
        public readonly engine: Engine,
        public readonly caller: Type<any> | null,
        public readonly script: string
    ) {}
}

export class InterruptScriptExecution extends IgnorableError {
    public one: boolean
    constructor(one: boolean = false) {
        super()
        this.one = one
    }
}

type CompareOpString = '_' | '!_' | '>' | '<' | '>_' | '<_'
const COMPARE_OP_MAP: Record<CompareOpString, CompareOp> = {
    _: 'EQ',
    '!_': 'NE',
    '>': 'GT',
    '<': 'LT',
    '>_': 'GE',
    '<_': 'LE',
}

function applyComparison(left: any, op: CompareOp, right: any): boolean {
    switch (op) {
        case 'EQ':
            return Compare.Equal(left, right)
        case 'NE':
            return Compare.NotEqual(left, right)
        case 'LT':
            return Compare.Less(left, right)
        case 'LE':
            return Compare.LessOrEqual(left, right)
        case 'GT':
            return Compare.Greater(left, right)
        case 'GE':
            return Compare.GreaterOrEqual(left, right)
        case 'HAS':
            return valueAsString(left).includes(valueAsString(right))
        default:
            throw new RuntimeError(`Unknown comparison operator: ${op}`)
    }
}

type GlobalHandler = (args: any[]) => Promise<any>

export class Interpreter {
    private readonly context: RuntimeContext
    private readonly globalHandlers: Map<string, GlobalHandler>
    private readonly globalInstances: Map<string, Type<any>>

    constructor(context: RuntimeContext) {
        this.context = context
        this.globalInstances = this.createGlobalInstances()
        this.globalHandlers = this.createGlobalHandlers()
    }

    async execute(statements: Statement[]): Promise<any> {
        let result: any = null
        for (const stmt of statements) {
            result = await this.executeStatement(stmt)
        }
        return result
    }

    async executeStatement(stmt: Statement): Promise<any> {
        return stmt.type === 'FunctionCall' ? this.executeFunctionCall(stmt) : this.evaluateParameter(stmt)
    }

    private createGlobalInstances(): Map<string, Type<any>> {
        const { engine } = this.context

        return new Map<string, Type<any>>([
            ['RANDOM', new Rand(engine, null, { TYPE: 'RAND', NAME: 'RANDOM' })],
            ['SYSTEM', new System(engine, null, { TYPE: 'SYSTEM', NAME: 'SYSTEM' })],
            ['CNVLOADER', new CNVLoader(engine, null, { TYPE: 'CNVLOADER', NAME: 'CNVLOADER' })],
        ])
    }

    private createGlobalHandlers(): Map<string, GlobalHandler> {
        return new Map<string, GlobalHandler>([
            ['IF', this.handleIf.bind(this)],
            ['BREAK', this.handleBreak.bind(this)],
            ['LOOP', this.handleLoop.bind(this)],
            ['WHILE', this.handleWhile.bind(this)],
        ])
    }

    private async handleIf(args: any[]): Promise<void> {
        let result: boolean
        let onTrue: Behaviour | null
        let onFalse: Behaviour | null

        if (args.length === 5) {
            const [a, operator, b, ifTrue, ifFalse] = args

            const left = typeof a === 'string' ? await this.execute(parseCode(a)) : a
            const right = typeof b === 'string' ? await this.execute(parseCode(b)) : b
            const op = COMPARE_OP_MAP[operator as CompareOpString]
            if (!op) {
                throw new RuntimeError(`Unknown comparison operator: ${operator}`)
            }

            result = applyComparison(left, op, right)
            onTrue = this.getObject(ifTrue)
            onFalse = this.getObject(ifFalse)
        } else if (args.length === 3) {
            const [expression, ifTrue, ifFalse] = args

            result = await this.evaluateLogicExpression(parseLogicExpression(expression))
            onTrue = this.getObject(ifTrue)
            onFalse = this.getObject(ifFalse)
        } else {
            throw new RuntimeError(`Invalid @IF arguments: expected 3 or 5, got ${args.length}`)
        }

        if (result && onTrue) {
            await onTrue.executeConditionalCallback()
        } else if (!result && onFalse) {
            await onFalse.executeConditionalCallback()
        }
    }

    private async handleBreak(_args: any[]): Promise<never> {
        throw new InterruptScriptExecution(false)
    }

    private async handleLoop(args: any[]): Promise<void> {
        const [codeOrBehaviour, start, len, step] = args

        const callback = createCallback(codeOrBehaviour)
        if (!callback) {
            throw new IrrecoverableError('Invalid @LOOP callback')
        }

        const counter = new Integer(this.context.engine, null, {
            NAME: '_I_',
            TYPE: 'INTEGER',
            TOINI: false,
        })

        for (let i = start; i < start + len; i += step) {
            await counter.setValue(i)

            try {
                await this.context.engine.scripting.executeCallback(
                    null,
                    this.context.caller,
                    callback,
                    [],
                    { _I_: counter },
                    true
                )
            } catch (err) {
                if (err instanceof InterruptScriptExecution) {
                    if (err.one) continue
                    break
                }
                throw err
            }
        }
    }

    private async handleWhile(args: any[]): Promise<void> {
        const [a, operator, b, codeOrBehaviour] = args

        const callback = createCallback(codeOrBehaviour)
        if (!callback) {
            throw new IrrecoverableError('Invalid @WHILE callback')
        }

        const op = COMPARE_OP_MAP[operator as CompareOpString]
        if (!op) {
            throw new RuntimeError(`Unknown comparison operator: ${operator}`)
        }

        const evaluateCondition = async (): Promise<boolean> => {
            const left = typeof a === 'string' ? await this.execute(parseCode(a)) : a
            const right = typeof b === 'string' ? await this.execute(parseCode(b)) : b
            return applyComparison(left, op, right)
        }

        while (await evaluateCondition()) {
            try {
                await this.context.engine.scripting.executeCallback(
                    null,
                    this.context.caller,
                    callback,
                    [],
                    undefined,
                    true
                )
            } catch (err) {
                if (err instanceof InterruptScriptExecution) {
                    if (err.one) continue
                    break
                }
                throw err
            }
        }
    }

    private async evaluateLogicExpression(expr: ConditionExpr): Promise<boolean> {
        if (expr.type === 'Condition') {
            const [left, right] = await Promise.all([
                this.evaluateParameter(expr.left),
                this.evaluateParameter(expr.right),
            ])
            return applyComparison(left, expr.operator, right)
        }

        const { operator, conditions } = expr
        if (conditions.length === 0) {
            return operator === 'AND'
        }

        const isOr = operator === 'OR'
        for (const condition of conditions) {
            const [left, right] = await Promise.all([
                this.evaluateParameter(condition.left),
                this.evaluateParameter(condition.right),
            ])
            if (applyComparison(left, condition.operator, right) === isOr) {
                return isOr
            }
        }

        return !isOr
    }

    private async executeFunctionCall(call: FunctionCall): Promise<any> {
        const args = await Promise.all(call.args.map((arg) => this.evaluateParameter(arg)))

        if (!call.target) {
            throw new RuntimeError('Bare methods not implemented')
        }

        switch (call.target.type) {
            case 'GlobalTarget': {
                const handler = this.globalHandlers.get(call.method)
                if (!handler) {
                    throw new RuntimeError(`Global method not found: @${call.method}`)
                }

                try {
                    const stackFrame = StackFrame.builder()
                        .type('specialCall')
                        .method(call.method)
                        .args(...args)
                        .build()
                    stackTrace.push(stackFrame)

                    return handler(args)
                } finally {
                    stackTrace.pop()
                }
            }

            case 'ObjectTarget': {
                const targetObj = await this.resolveObjectRef(call.target.ref)
                if (!targetObj) {
                    return null
                }

                try {
                    const stackFrame = StackFrame.builder()
                        .type('method')
                        .object(targetObj)
                        .method(call.method)
                        .args(...args)
                        .build()
                    stackTrace.push(stackFrame)

                    const method = (targetObj as any)[call.method]
                    return method !== undefined ? method.bind(targetObj)(...args) : targetObj.__call(call.method, args)
                } catch (err) {
                    if (err instanceof IgnorableError) throw err

                    const beforePart = this.context.script.substring(0, call.start).replaceAll(';', ';\n')
                    const callPart = this.context.script.substring(call.start, call.end)
                    const afterPart = this.context.script.substring(call.end).replaceAll(';', ';\n').trim()
                    logger.error(
                        fmt`Error occured during method execution:\n${beforePart}${color('red', callPart)}${afterPart}\n`,
                        {
                            args,
                        },
                        err
                    )
                    printStackTrace()

                    if (err instanceof NotImplementedError) return null
                    // eslint-disable-next-line no-debugger
                    debugger
                    throw new SilentError(err)
                } finally {
                    stackTrace.pop()
                }
            }

            default:
                throw new RuntimeError(`Unknown target type: ${(call.target as any).type}`)
        }
    }

    async evaluateParameter(param: Parameter): Promise<any> {
        switch (param.type) {
            case 'NumberLiteral': {
                const value = toNumber(param.value)
                if (isNaN(value)) {
                    throw new RuntimeError(`Invalid number literal: ${param.value}`)
                }
                return value
            }
            case 'StringLiteral':
                return param.value
            case 'BooleanLiteral':
                return param.value
            case 'BracketExpression':
                return this.evaluateExpression(param.expression)
            case 'Identifier': {
                const object = this.getObject<Type<any>>(param.name)
                if (object instanceof ValueType) {
                    return await object.getValue()
                }
                return param.name
            }
            case 'FieldAccess': {
                const obj = this.getObject<Struct>(param.objectName)
                if (!obj) {
                    throw new RuntimeError(`Cannot access field ${param.fieldName} on non-object ${param.objectName}`)
                }
                if (!(obj instanceof Struct)) {
                    throw new RuntimeError('Failed to access field: object is not a Struct')
                }
                const field = obj.getField(param.fieldName)
                if (field === undefined) {
                    throw new RuntimeError(`Field ${param.fieldName} not found on object ${param.objectName}`)
                }
                return await field.getValue()
            }
            case 'ConversionCall':
                throw new RuntimeError('Unsupported conversion call')
            case 'FunctionCall':
                return this.executeFunctionCall(param)
            default:
                throw new RuntimeError(`Unknown parameter type: ${(param as any).type}`)
        }
    }

    private async evaluateExpression(expr: Expression): Promise<any> {
        let result = await this.evaluateParameter(expr.head)

        for (const step of expr.tail) {
            let operand = await this.evaluateParameter(step.operand)

            if (typeof result === 'number' && typeof operand === 'string') {
                operand = ForceNumber(operand)
            }

            switch (step.op) {
                case 'ADD':
                    result = result + operand
                    break
                case 'SUB':
                    result = result - operand
                    break
                case 'MUL':
                    result = result * operand
                    break
                case 'DIV':
                    if (operand === 0) throw new RuntimeError('Division by zero')
                    result = result / operand
                    break
                case 'MOD':
                    if (operand === 0) throw new RuntimeError('Modulo by zero')
                    result = result % operand
                    break
                default:
                    throw new RuntimeError(`Unknown operator: ${step.op}`)
            }
        }

        return result
    }

    private async resolveObjectRef(ref: ObjectRef | IndirectRef): Promise<Type<any> | null> {
        switch (ref.type) {
            case 'ThisRef':
                return this.getObject('THIS')
            case 'DirectRef':
                throw new RuntimeError(`Unsupported ref: ${ref.type}`)
            case 'Identifier':
                return this.getObject(ref.name)
            case 'IndirectRef':
                return this.getObject(await this.evaluateParameter(ref.inner))
            default:
                throw new RuntimeError(`Unknown ref type: ${(ref as any).type}`)
        }
    }

    private getObject<T extends Type<any>>(name: string): T | null {
        const object = this.context.engine.getObject<T>(name, this.context.caller?.parentScope)
        if (object === null && this.globalInstances.has(name)) {
            return this.globalInstances.get(name)! as T
        }
        return object
    }
}

export async function runCode(
    engine: Engine,
    caller: Type<any> | null,
    script: string,
    args: any[],
    isSingleStatement: boolean
): Promise<any> {
    const processedScript = await substituteArguments(script, args)
    const ast = parseCode(processedScript)

    const context = new RuntimeContext(engine, caller, processedScript)
    const interpreter = new Interpreter(context)

    try {
        return isSingleStatement ? await interpreter.executeStatement(ast[0]) : await interpreter.execute(ast)
    } catch (err) {
        if (err instanceof IgnorableError) throw err
        if (!(err instanceof SilentError)) throw err
    }
}

async function substituteArguments(script: string, args: any[]): Promise<string> {
    const regex = /\$(\d+)/g
    const parts: (string | Promise<string>)[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(script)) !== null) {
        parts.push(script.slice(lastIndex, match.index))

        const valueIndex = parseInt(match[1], 10) - 1

        if (valueIndex < 0 || valueIndex >= args.length) {
            parts.push(match[0])
        } else {
            const arg = args[valueIndex]

            if (arg instanceof CMCString) {
                parts.push(String(await arg.getValue()))
            } else if (arg instanceof Type) {
                parts.push(arg.name)
            } else {
                parts.push(String(arg))
            }
        }

        lastIndex = regex.lastIndex
    }

    parts.push(script.slice(lastIndex))

    const resolved = await Promise.all(parts)
    return resolved.join('')
}

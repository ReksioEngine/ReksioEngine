import type { FunctionCall, Parameter, Statement, Expression, IndirectRef, ObjectRef } from './ast'
import { Engine } from '../engine'
import { Type, ValueType } from '../engine/types'
import { Struct } from '../engine/types/struct'
import { callMethod, ForceNumber, valueAsDouble, valueAsInteger, valueAsString } from '../common/types'
import { Rand } from '../engine/types/rand'
import { System } from '../engine/types/system'
import { CNVLoader } from '../engine/types/cnvloader'
import { createCallback } from '../fileFormats/common'
import {
    assert,
    IgnorableError,
    InterruptScriptExecution,
    IrrecoverableError,
    NotImplementedError,
} from '../common/errors'
import { Integer } from '../engine/types/integer'
import { String as CMCString } from '../engine/types/string'
import {
    applyArithmetic,
    compareValues,
    createBool,
    createDouble,
    createInteger,
    createString,
    unwrapValue,
    Value,
} from '../engine/types/values'
import { parseCode } from './parser'
import { parseLogicExpression } from './expression'
import { CompareOp, ConditionExpr } from './expression/ast'
import { color, fmt, logger } from '../engine/logging'
import { captureStackTrace, popStackFrame, printStackTrace, pushStackFrame, StackFrame } from './stacktrace'

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

class Return extends IgnorableError {
    public value: Value
    constructor(value: Value) {
        super()
        this.value = value
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

type GlobalHandler = (args: Value[]) => Promise<void>

export class Interpreter {
    private readonly context: RuntimeContext
    private readonly globalHandlers: Map<string, GlobalHandler>
    private readonly globalInstances: Map<string, Type<any>>

    constructor(context: RuntimeContext) {
        this.context = context
        this.globalInstances = this.createGlobalInstances()
        this.globalHandlers = this.createGlobalHandlers()
    }

    async execute(statements: Statement[]): Promise<Value> {
        let result: Value = null
        for (const stmt of statements) {
            result = await this.executeStatement(stmt)
        }
        return result
    }

    async executeStatement(stmt: Statement): Promise<Value> {
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
            ['RETURN', this.handleReturn.bind(this)],
        ])
    }

    // String operands of @IF and @WHILE are code that is run to get the value
    private async evaluateOperand(operand: Value): Promise<Value> {
        if (operand instanceof CMCString) {
            return await this.execute(parseCode(await operand.getValue()))
        }
        return operand
    }

    private async handleIf(args: Value[]): Promise<void> {
        let result: boolean
        let ifTrue: string
        let ifFalse: string

        if (args.length === 5) {
            const [a, operator, b, trueBranch, falseBranch] = args

            const left = await this.evaluateOperand(a)
            const right = await this.evaluateOperand(b)
            const op = COMPARE_OP_MAP[valueAsString(await unwrapValue(operator)) as CompareOpString]
            if (!op) {
                throw new RuntimeError(`Unknown comparison operator: ${await unwrapValue(operator)}`)
            }

            result = await compareValues(this.context.engine, left, op, right)
            ifTrue = valueAsString(await unwrapValue(trueBranch))
            ifFalse = valueAsString(await unwrapValue(falseBranch))
        } else if (args.length === 3) {
            const [expression, trueBranch, falseBranch] = args

            result = await this.evaluateLogicExpression(
                parseLogicExpression(valueAsString(await unwrapValue(expression)))
            )
            ifTrue = valueAsString(await unwrapValue(trueBranch))
            ifFalse = valueAsString(await unwrapValue(falseBranch))
        } else {
            throw new RuntimeError(`Invalid @IF arguments: expected 3 or 5, got ${args.length}`)
        }

        const callback = createCallback(result ? ifTrue : ifFalse)
        if (callback === undefined) {
            return
        }

        await this.context.engine.scripting.executeCallback(null, this.context.caller, callback, [], undefined, true)
    }

    private async handleBreak(_args: any[]): Promise<never> {
        throw new InterruptScriptExecution(false)
    }

    private async handleReturn(args: Value[]): Promise<void> {
        throw new Return(args[0] ?? null)
    }

    private async handleLoop(args: Value[]): Promise<void> {
        const values = []
        for (const arg of args) {
            values.push(await unwrapValue(arg))
        }
        const [codeOrBehaviour, start, len, step] = values

        const callback = createCallback(valueAsString(codeOrBehaviour))
        if (!callback) {
            throw new IrrecoverableError('Invalid @LOOP callback')
        }

        const counter = new Integer(this.context.engine, null, {
            NAME: '_I_',
            TYPE: 'INTEGER',
            TOINI: false,
        })

        const from = valueAsInteger(start)
        const to = from + valueAsInteger(len)
        const increment = valueAsInteger(step)
        for (let i = from; i < to; i += increment) {
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
                    if (err.one) {
                        continue
                    }
                    break
                }
                throw err
            }
        }
    }

    private async handleWhile(args: Value[]): Promise<void> {
        const [a, operator, b, codeOrBehaviour] = args

        const callback = createCallback(valueAsString(await unwrapValue(codeOrBehaviour)))
        if (!callback) {
            throw new IrrecoverableError('Invalid @WHILE callback')
        }

        const operatorName = valueAsString(await unwrapValue(operator))
        const op = COMPARE_OP_MAP[operatorName as CompareOpString]
        if (!op) {
            throw new RuntimeError(`Unknown comparison operator: ${operatorName}`)
        }

        const evaluateCondition = async (): Promise<boolean> => {
            const left = await this.evaluateOperand(a)
            const right = await this.evaluateOperand(b)
            return compareValues(this.context.engine, left, op, right)
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
                    if (err.one) {
                        continue
                    }
                    break
                }
                throw err
            }
        }
    }

    private async evaluateLogicExpression(expr: ConditionExpr): Promise<boolean> {
        if (expr.type === 'Condition') {
            const left = await this.evaluateParameter(expr.left)
            const right = await this.evaluateParameter(expr.right)
            return compareValues(this.context.engine, left, expr.operator, right)
        }

        const { operator, conditions } = expr
        if (conditions.length === 0) {
            return operator === 'AND'
        }

        const isOr = operator === 'OR'
        for (const condition of conditions) {
            const left = await this.evaluateParameter(condition.left)
            const right = await this.evaluateParameter(condition.right)
            if ((await compareValues(this.context.engine, left, condition.operator, right)) === isOr) {
                return isOr
            }
        }

        return !isOr
    }

    private async executeFunctionCall(call: FunctionCall): Promise<Value> {
        const args = []
        for (const arg of call.args) {
            args.push(await this.evaluateParameter(arg))
        }

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
                    pushStackFrame(stackFrame)

                    await handler(args)
                    return null
                } catch (err) {
                    captureStackTrace(err)
                    throw err
                } finally {
                    popStackFrame()
                }
            }

            case 'ObjectTarget': {
                const targetObj = await this.resolveObjectRef(call.target.ref)
                if (!targetObj) {
                    return null
                }

                try {
                    pushStackFrame(
                        StackFrame.builder()
                            .type('method')
                            .object(targetObj)
                            .method(call.method)
                            .args(...args)
                            .build()
                    )

                    const result =
                        (targetObj as any)[call.method] !== undefined
                            ? await callMethod(targetObj, call.method, args)
                            : await targetObj.__call(call.method, args)
                    assert(
                        result === undefined || result === null || result instanceof ValueType,
                        `${targetObj.name}^${call.method} returned a primitive instead of an engine value`
                    )
                    return result ?? null
                } catch (err) {
                    if (err instanceof IgnorableError) {
                        throw err
                    }

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
                    printStackTrace(captureStackTrace(err))

                    if (err instanceof NotImplementedError) {
                        return null
                    }
                    // eslint-disable-next-line no-debugger
                    debugger
                    throw new SilentError(err)
                } finally {
                    popStackFrame()
                }
            }

            default:
                throw new RuntimeError(`Unknown target type: ${(call.target as any).type}`)
        }
    }

    async evaluateParameter(param: Parameter): Promise<Value> {
        const { engine } = this.context

        switch (param.type) {
            case 'NumberLiteral': {
                const value = ForceNumber(param.value)
                return String(param.value).includes('.') ? createDouble(engine, value) : createInteger(engine, value)
            }
            case 'StringLiteral':
                return createString(engine, param.value)
            case 'BooleanLiteral':
                return createBool(engine, param.value)
            case 'BracketExpression':
                return this.evaluateExpression(param.expression)
            case 'Identifier': {
                const object = this.getObject<Type<any>>(param.name)
                if (object instanceof ValueType) {
                    return object
                }
                return createString(engine, param.name)
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
                return field
            }
            case 'ConversionCall':
                throw new RuntimeError('Unsupported conversion call')
            case 'FunctionCall':
                return this.executeFunctionCall(param)
            default:
                throw new RuntimeError(`Unknown parameter type: ${(param as any).type}`)
        }
    }

    private async evaluateExpression(expr: Expression): Promise<Value> {
        let result = await this.evaluateParameter(expr.head)

        for (const step of expr.tail) {
            const operand = await this.evaluateParameter(step.operand)

            if ((step.op === 'DIV' || step.op === 'MOD') && valueAsDouble(await unwrapValue(operand)) === 0) {
                throw new RuntimeError(step.op === 'DIV' ? 'Division by zero' : 'Modulo by zero')
            }

            result = await applyArithmetic(this.context.engine, result, step.op, operand)
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
                return this.getObject(valueAsString(await unwrapValue(await this.evaluateParameter(ref.inner))))
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
): Promise<Value | undefined> {
    const processedScript = await substituteArguments(script.replaceAll(' ', ''), args)
    const ast = parseCode(processedScript)

    const context = new RuntimeContext(engine, caller, processedScript)
    const interpreter = new Interpreter(context)

    try {
        if (isSingleStatement) {
            return await interpreter.executeStatement(ast[0])
        } else {
            await interpreter.execute(ast)
        }
    } catch (err) {
        if (err instanceof Return) {
            return err.value
        }
        if (err instanceof IgnorableError) {
            throw err
        }
        if (!(err instanceof SilentError)) {
            throw err
        }
    }
}

async function substituteArguments(script: string, args: any[]): Promise<string> {
    const regex = /\$(\d+)/g
    const parts: string[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(script)) !== null) {
        parts.push(script.slice(lastIndex, match.index))

        const valueIndex = parseInt(match[1], 10) - 1

        if (valueIndex < 0 || valueIndex >= args.length) {
            parts.push(match[0])
        } else {
            const arg = args[valueIndex]

            if (arg instanceof CMCString || (arg instanceof ValueType && arg.name === '')) {
                parts.push(valueAsString(await arg.getValue()))
            } else if (arg instanceof Type) {
                parts.push(arg.name)
            } else {
                parts.push(String(arg))
            }
        }

        lastIndex = regex.lastIndex
    }

    parts.push(script.slice(lastIndex))
    return parts.join('')
}

import { Type } from '../../engine/types'
import { valueAsString } from '../../types'

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

export const generateStackTrace = (stackTraceSource: StackFrame[]) => {
    const lines: string[] = []

    for (const frame of stackTraceSource) {
        const argsString = (frame.args ?? [])
            .map((arg) => {
                if ((typeof arg !== 'object' || arg === null) && arg !== undefined) {
                    const asString = valueAsString(arg)
                    return typeof arg === 'string' ? `"${asString}"` : asString
                } else if (arg === undefined) {
                    return '<undefined>'
                } else {
                    return arg.toString()
                }
            })
            .join(',')

        switch (frame.type) {
            case 'callback':
                lines.push(`at ${frame.object?.name ?? '<unknown>'}@${frame.callback}(${argsString})`)
                break
            case 'method':
                lines.push(`at ${frame.object?.name ?? '<unknown>'}^${frame.methodName}(${argsString})`)
                break
            case 'behaviour':
                lines.push(`at ${frame.behaviour}(${argsString})`)
                break
        }
    }

    return '\t' + lines.join('\n\t')
}

export const printStackTrace = (stackTraceSource: StackFrame[] | null = null) => {
    const selectedStackTrace = stackTraceSource ?? stackTrace
    if (selectedStackTrace.length === 0) {
        console.error('Stack trace is empty')
        return
    }
    console.error(generateStackTrace(stackTraceSource ?? stackTrace))
}

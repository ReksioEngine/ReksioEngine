import { Type } from '../engine/types'
import { valueAsString } from '../types'

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
        const argsString = (frame.args ?? [])
            .map((arg) => (arg !== undefined ? valueAsString(arg) : '<undefined>'))
            .join(',')

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

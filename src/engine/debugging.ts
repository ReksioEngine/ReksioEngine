import {Episode} from './types/episode'
import {Type} from './types'
import {Engine} from './index'

export class CodeSource {
    public object: Type<any>
    public callback: string

    constructor(object: Type<any>, callback: string) {
        this.object = object
        this.callback = callback
    }
}

export type DebuggerReport = {
    objectName: string
    methodName: string
    args: any[]
    argsVariables: object
    script: string
    columnStart: number
    columnEnd: number
    codeSource: string
}

type Breakpoint = {
    codeSource: string
    columnStart: number
    columnEnd: number
}

export class DebuggerSession {
    public breakOnAny = false
    private breakpoints: Breakpoint[] = []

    public init() {
        window.addEventListener('message', (event) => {
            if (event.source !== window || event.data.source === 'engine') {
                return
            }
            this.handleMessage(event.data.type, event.data.data)
        })
    }

    public sendMessage(type: string, data?: any) {
        window.postMessage({type, data, source: 'engine'}, '*')
    }

    private handleMessage(type: string, data: any) {
        switch (type) {
        case 'debuggerConnect':
            this.sendMessage('connected')
            break
        case 'breakOnAny':
            this.breakOnAny = data.value
        }
    }

    public addBreakpoint(breakpoint: Breakpoint) {
        this.breakpoints.push(breakpoint)
    }

    public hasBreakpoint(debugInfo: DebuggerReport) {
        return this.breakpoints.find(breakpoint => {
            return breakpoint.codeSource === debugInfo.codeSource
                && debugInfo.columnStart > breakpoint.columnStart
                && debugInfo.columnStart < breakpoint.columnEnd
        }) !== undefined
    }
}

export const setupDebugScene = (engine: Engine) => {
    if (engine.debug) {
        const debug: any = document.querySelector('#debug')!
        debug.style.display = 'block'

        const episode: Episode = Object.values(engine.globalScope).find((object: Type<any>) => object.definition.TYPE === 'EPISODE')
        const container: any = document.querySelector('#sceneSelector')!
        for (const scene of episode.definition.SCENES) {
            const option = document.createElement('option')
            option.value = scene
            option.text = scene
            container.appendChild(option)
        }
        const button = document.querySelector('#changeScene')!
        button.addEventListener('click', () => {
            engine.changeScene(container.value)
        })
    }
}

export const updateCurrentScene = (engine: Engine) => {
    if (engine.debug) {
        const currentScene = document.querySelector('#currentScene')!
        currentScene.textContent = engine.currentScene!.definition.NAME
    }
}
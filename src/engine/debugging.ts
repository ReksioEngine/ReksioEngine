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

export class DebuggerSession {
    public breakOnAny = false

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
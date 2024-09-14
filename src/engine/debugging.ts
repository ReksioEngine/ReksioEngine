import {Episode} from './types/episode'
import {Type} from './types'
import {Engine} from './index'
import {sound} from '@pixi/sound'

export const setupDebugScene = (engine: Engine) => {
    if (engine.debug) {
        const debug: any = document.querySelector('#debug')!
        debug.style.display = 'block'

        debug.querySelector('#speed').addEventListener('input', (e: InputEvent) => {
            const target = e.target as HTMLInputElement

            let sliderValue = target.value as unknown as number
            if (sliderValue > 1) {
                sliderValue = Math.round(1 + (sliderValue - 1) * 10)
            }

            engine.speed = sliderValue
            engine.app.ticker.speed = sliderValue
            sound.speedAll = sliderValue
            debug.querySelector('#speedDisplay').textContent = `(${sliderValue}x)`
        })

        debug.querySelector('#speedReset').addEventListener('click', (e: InputEvent) => {
            debug.querySelector('#speed').value = 1
            engine.speed = 1
            engine.app.ticker.speed = 1
            sound.speedAll = 1
            debug.querySelector('#speedDisplay').textContent = '(1x)'
        })

        const episode: Episode = Object.values(engine.globalScope).find((object: Type<any>) => object.definition.TYPE === 'EPISODE')
        const container: any = document.querySelector('#sceneSelector')!
        for (const sceneName of episode.definition.SCENES) {
            const scene = Object.values(engine.globalScope).find((object: Type<any>) => {
                return object.definition.TYPE === 'SCENE' && object.definition.NAME === sceneName
            })

            const sceneDefPath = scene.getRelativePath(`${sceneName}.cnv`)
            const canGoTo = engine.fileLoader.getFilesListing().includes(sceneDefPath.toLowerCase())

            const option = document.createElement('option')
            option.value = sceneName
            option.text = sceneName
            option.disabled = !canGoTo
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

import {Episode} from './types/episode'
import {Type} from './types'
import {Engine} from './index'

export const setupDebugScene = (engine: Engine) => {
    if (engine.debug) {
        const debug: any = document.querySelector('#debug')!
        debug.style.display = 'block'

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

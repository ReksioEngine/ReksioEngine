import {Episode} from './types/episode'
import {Type} from './types'
import {Engine} from './index'
import {sound} from '@pixi/sound'
import {ArchiveOrgFileLoader, GithubFileLoader} from './filesLoader'

export class Debugging {
    private engine: Engine
    public isDebug = false

    public nextSceneOverwrite: string | null = null

    constructor(engine: Engine, isDebug: boolean) {
        this.engine = engine
        this.isDebug = isDebug
    }

    applyQueryParams() {
        if (!this.isDebug) {
            return
        }

        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has('loader') && urlParams.has('source')) {
            const loader = urlParams.get('loader')!
            const source = urlParams.get('source')!

            if (loader === 'github') {
                this.engine.fileLoader = new GithubFileLoader(source)
            } else if (loader === 'archiveorg') {
                this.engine.fileLoader = new ArchiveOrgFileLoader(source)
            }
        }

        this.nextSceneOverwrite = urlParams.get('scene')
    }

    setupSceneSelector() {
        if (!this.isDebug) {
            return
        }

        const debug: any = document.querySelector('#debug')!
        debug.style.display = 'block'

        debug.querySelector('#speed').addEventListener('input', (e: InputEvent) => {
            const target = e.target as HTMLInputElement

            let sliderValue = target.value as unknown as number
            if (sliderValue > 1) {
                sliderValue = Math.round(1 + (sliderValue - 1) * 10)
            }

            this.engine.speed = sliderValue
            this.engine.app.ticker.speed = sliderValue
            sound.speedAll = sliderValue
            debug.querySelector('#speedDisplay').textContent = `(${sliderValue}x)`
        })

        debug.querySelector('#speedReset').addEventListener('click', (e: InputEvent) => {
            debug.querySelector('#speed').value = 1
            this.engine.speed = 1
            this.engine.app.ticker.speed = 1
            sound.speedAll = 1
            debug.querySelector('#speedDisplay').textContent = '(1x)'
        })

        const episode: Episode = Object.values(this.engine.globalScope).find((object: Type<any>) => object.definition.TYPE === 'EPISODE')
        const container: any = document.querySelector('#sceneSelector')!
        for (const sceneName of episode.definition.SCENES) {
            const scene = Object.values(this.engine.globalScope).find((object: Type<any>) => {
                return object.definition.TYPE === 'SCENE' && object.definition.NAME === sceneName
            })

            const sceneDefPath = scene.getRelativePath(`${sceneName}.cnv`)
            const canGoTo = this.engine.fileLoader.getFilesListing().includes(sceneDefPath.toLowerCase())

            const option = document.createElement('option')
            option.value = sceneName
            option.text = sceneName
            option.disabled = !canGoTo
            container.appendChild(option)
        }
        const button = document.querySelector('#changeScene')!
        button.addEventListener('click', () => {
            this.engine.changeScene(container.value)
        })
    }

    updateCurrentScene (){
        if (this.isDebug) {
            const currentScene = document.querySelector('#currentScene')!
            currentScene.textContent = this.engine.currentScene!.definition.NAME
        }
    }
}

import { Engine } from './engine'
import * as PIXI from 'pixi.js'
import { FileLoader } from './loaders/filesLoader'
import { SaveFile, SaveFileManager } from './engine/saveFile'
export * as FileLoaders from './loaders/filesLoader'
export { SaveFile, SaveFileManager, createSaveFileLocalStorageHandler } from './engine/saveFile'

export const BUILD_VARS = {
    manualTick: process.env.manualTick as unknown as boolean,
    debug: process.env.debug as unknown as boolean,
}

export type GamePlayerOptions = {
    fileLoader: FileLoader
    startScene?: string
    saveFile?: SaveFile
    debug?: boolean
    debugContainer?: HTMLElement | null
    onExit?: () => void
    onSceneChange?: (next: string, previous?: string) => void
    onSaveFileUpdate?: (saveFile: SaveFile) => void
}

export class GamePlayerInstance {
    constructor(private engine: Engine) {}

    start() {
        void this.engine.start()
    }

    restart(extraOptions?: GamePlayerOptions) {
        const app = new PIXI.Application({
            view: this.engine.app.view
        })

        this.destroy()
        this.engine = new Engine(app, {...this.engine.options, ...(extraOptions ?? {})})
        void this.engine.init()
        void this.engine.start()
    }

    destroy() {
        this.engine.destroy()
    }

    exportSaveFile() {
        return SaveFileManager.toINI(this.engine.saveFile)
    }

    importSaveFile(content: string) {
        this.restart({
            saveFile: SaveFileManager.fromINI(content, this.engine.saveFile.onChange)
        } as GamePlayerOptions)
    }

    get currentScene() {
        return this.engine.currentScene?.name ?? null
    }
}

export const createGamePlayer = (element: HTMLElement | null, options: GamePlayerOptions) => {
    if (element === null) {
        return null
    }

    const app = new PIXI.Application()
    element.appendChild(app.view as unknown as Node)

    const engine = new Engine(app, options)
    void engine.init()

    return new GamePlayerInstance(engine)
}

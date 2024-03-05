import {Options, Sound} from '@pixi/sound'
import {FileLoader} from '../filesLoader'

export const loadSound = async (fileLoader: FileLoader, filename: string, options?: Options) => {
    return Sound.from({
        source: await fileLoader.getRawFile(filename),
        ...options
    })
}

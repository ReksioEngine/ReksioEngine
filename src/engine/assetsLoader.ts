import {Options, Sound} from '@pixi/sound'
import {getRawFile} from '../filesLoader'

export const loadSound = async (filename: string, options?: Options) => {
    return Sound.from({
        source: await getRawFile(filename),
        ...options
    })
}

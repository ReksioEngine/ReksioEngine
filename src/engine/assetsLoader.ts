import {Sound} from '@pixi/sound'
import {getRawFile} from '../filesLoader'

export const loadSound = async (filename: string) => {
    return Sound.from(await getRawFile(filename))
}

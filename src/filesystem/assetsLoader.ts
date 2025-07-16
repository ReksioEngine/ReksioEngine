import { Options, Sound } from '@pixi/sound'
import * as PIXI from 'pixi.js'
import { AdvancedSprite, createHitmapFromImageBytes } from '../engine/rendering'
import { ISound, SimulatedSound, soundLibrary } from '../engine/sounds'
import { BUILD_VARS } from '../index'
import Filesystem from './index'

export const loadSound = async (fileLoader: Filesystem, filename: string, options?: Options): Promise<ISound> => {
    const buffer = await fileLoader.getFile(filename)
    const sound = await new Promise<Sound>((resolve, reject) => {
        Sound.from({
            source: buffer,
            preload: true,
            loaded: (err, sound) => {
                if (err || !sound) {
                    reject(err)
                } else {
                    resolve(sound)
                }
            },
            ...options,
        })
    })

    const result = BUILD_VARS.manualTick ? new SimulatedSound(sound) : sound
    soundLibrary.register(result)
    return result
}

export const loadSprite = async (fileLoader: Filesystem, filename: string) => {
    const image = await fileLoader.getIMGFile(filename)
    const imageBytes = new Uint8Array(image.bytes)

    const baseTexture = PIXI.BaseTexture.fromBuffer(
        new Uint8Array(image.bytes),
        image.header.width,
        image.header.height
    )

    const texture = new PIXI.Texture(baseTexture)
    const sprite = new AdvancedSprite(texture)

    sprite.x = image.header.positionX
    sprite.y = image.header.positionY
    sprite.hitmap = createHitmapFromImageBytes(imageBytes)

    return sprite
}

export const loadTexture = async (fileLoader: Filesystem, filename: string) => {
    const image = await fileLoader.getIMGFile(filename)
    const baseTexture = PIXI.BaseTexture.fromBuffer(
        new Uint8Array(image.bytes),
        image.header.width,
        image.header.height
    )

    return new PIXI.Texture(baseTexture)
}

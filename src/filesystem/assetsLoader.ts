import * as PIXI from 'pixi.js'
import { AdvancedSprite, createHitmapFromImageBytes } from '../engine/rendering'
import Filesystem from './index'
import { globalAudio, Sound } from '../engine/audio'

export const loadSound = async (fileLoader: Filesystem, filename: string): Promise<Sound> => {
    const buffer = await fileLoader.getFile(filename)
    return globalAudio.load(buffer)
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

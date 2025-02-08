import { Options, Sound } from '@pixi/sound'
import { FileLoader } from './filesLoader'
import * as PIXI from 'pixi.js'
import { AdvancedSprite, createHitmapFromImageBytes } from '../engine/rendering'

export const loadSound = async (fileLoader: FileLoader, filename: string, options?: Options) => {
    return Sound.from({
        source: await fileLoader.getRawFile(filename),
        ...options,
    })
}

export const loadSprite = async (fileLoader: FileLoader, filename: string) => {
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

export const loadTexture = async (fileLoader: FileLoader, filename: string) => {
    const image = await fileLoader.getIMGFile(filename)
    const baseTexture = PIXI.BaseTexture.fromBuffer(
        new Uint8Array(image.bytes),
        image.header.width,
        image.header.height
    )

    return new PIXI.Texture(baseTexture)
}

import {Options, Sound} from '@pixi/sound'
import {FileLoader} from '../filesLoader'
import {Sprite} from "pixi.js";
import * as PIXI from "pixi.js";

export const loadSound = async (fileLoader: FileLoader, filename: string, options?: Options) => {
    return Sound.from({
        source: await fileLoader.getRawFile(filename),
        ...options
    })
}

export const loadSprite = async (fileLoader: FileLoader, filename: string) => {
    const image = await fileLoader.getIMGFile(filename)
    const baseTexture = PIXI.BaseTexture.fromBuffer(
        new Uint8Array(image.bytes),
        image.header.width,
        image.header.height
    )

    const texture = new PIXI.Texture(baseTexture)
    const sprite = new PIXI.Sprite(texture)

    sprite.x = image.header.positionX
    sprite.y = image.header.positionY

    return sprite
}

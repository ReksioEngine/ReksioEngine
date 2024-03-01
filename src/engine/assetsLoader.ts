import {Options, Sound} from '@pixi/sound'
import {getIMGFile, getRawFile} from '../filesLoader'
import {Sprite} from "pixi.js";
import * as PIXI from "pixi.js";

export const loadSound = async (filename: string, options?: Options) => {
    return Sound.from({
        source: await getRawFile(filename),
        ...options
    })
}

export const loadSprite = async (filename: string) => {
    const image = await getIMGFile(filename)
    const baseTexture = PIXI.BaseTexture.fromBuffer(
        new Uint8Array(image.bytes),
        image.header.width,
        image.header.height
    )

    const texture = new PIXI.Texture(baseTexture)
    return new PIXI.Sprite(texture)
}

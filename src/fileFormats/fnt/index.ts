import { BinaryBuffer } from '../utils'
import { loadImageWithoutHeader } from '../img'
import { CompressionType } from '../compression'
import * as PIXI from 'pixi.js'
import { BitmapFont, BitmapFontData } from 'pixi.js'

const decoder = new TextDecoder('windows-1250')

interface Info {
    pixelsInLine: number
    charHeight: number
    charWidth: number
    charsCount: number
    charsAscii: string
    kerning: number[]
    cutFromLeft: number[]
    cutFromRight: number[]
}

const parse = (view: BinaryBuffer) => {
    const magic = view.getUint32()
    if (magic != 0x544e46) {
        throw new Error('Not a font')
    }

    const font = {} as Info
    font.pixelsInLine = view.getUint32()
    font.charHeight = view.getUint32()
    font.charWidth = view.getUint32()
    font.charsCount = view.getUint32()
    font.charsAscii = decoder.decode(new Uint8Array(view.read(font.charsCount)))
    font.kerning = Array.from(new Int8Array(view.read(font.charsCount * font.charsCount)))
    font.cutFromLeft = Array.from(new Uint8Array(view.read(font.charsCount)))
    font.cutFromRight = Array.from(new Uint8Array(view.read(font.charsCount)))
    return font
}

export const parseFont = (data: ArrayBuffer) => {
    const buffer = new BinaryBuffer(new DataView(data))
    const header = parse(buffer)

    const image = loadImageWithoutHeader(
        buffer,
        {
            compressionType: CompressionType.NONE,
            compressedLen: 2 * header.pixelsInLine * header.charHeight,
            decompressedLen: 2 * header.pixelsInLine * header.charHeight,
            pixelLen: 2,
        },
        {
            compressionType: CompressionType.NONE,
            compressedLen: header.pixelsInLine * header.charHeight,
            decompressedLen: header.pixelsInLine * header.charHeight,
            pixelLen: 1,
        }
    )

    const baseTexture = PIXI.BaseTexture.fromBuffer(new Uint8Array(image), header.pixelsInLine, header.charHeight)
    const texture = new PIXI.Texture(baseTexture)

    const chars: PIXI.IBitmapFontDataChar[] = []
    const actualCharWidth = header.pixelsInLine / header.charsCount
    for (let i = 0; i < header.charsCount; i++) {
        const charCode = header.charsAscii[i].charCodeAt(0)
        chars.push({
            id: charCode,
            page: 0,
            x: actualCharWidth * i,
            y: 0,
            width: actualCharWidth,
            height: header.charHeight,
            xoffset: -header.cutFromLeft[i],
            yoffset: 0,
            xadvance: actualCharWidth - header.cutFromRight[i] - header.cutFromLeft[i],
        })
    }

    const kerning: PIXI.IBitmapFontDataKerning[] = []
    for (let first = 0; first < header.charsCount; first++) {
        const charRange = header.kerning.slice(first * header.charsCount, first * header.charsCount + header.charsCount)
        for (let second = 0; second < header.charsCount; second++) {
            kerning.push({
                first: header.charsAscii[first].charCodeAt(0),
                second: header.charsAscii[second].charCodeAt(0),
                amount: 2 - charRange[second],
            })
        }
    }

    const fontData = new BitmapFontData()
    fontData.info = [
        {
            face: crypto.randomUUID(),
            size: header.charHeight,
        },
    ]
    fontData.common = [
        {
            lineHeight: header.charHeight,
        },
    ]
    fontData.distanceField = []
    fontData.page = [
        {
            id: 0,
            file: '',
        },
    ]
    fontData.char = chars
    fontData.kerning = kerning

    return BitmapFont.install(fontData, [texture], true)
}

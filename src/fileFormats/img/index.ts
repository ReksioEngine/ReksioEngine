import {BinaryBuffer} from '../utils'
import {decompress as CLZWDecompress} from '../compression/clzw'
import {decompress as CRLEDecompress} from '../compression/crle'
import {CompressionType} from '../compression'

interface ImageHeader {
    width: number
    height: number
    bpp: number
    imageLen: number
    compressionType: number
    alphaLen: number
    positionX: number
    positionY: number
}

export interface Image {
    header: ImageHeader
    bytes: ArrayBuffer
}

const parseHeader = (view: BinaryBuffer) => {
    const magic = view.getUint32()
    if (magic != 0x4b4950) {
        throw new Error('Not an image')
    }

    const image = {} as ImageHeader
    image.width = view.getUint32()
    image.height = view.getUint32()
    image.bpp = view.getUint32()
    image.imageLen = view.getUint32()
    view.skip(4) // not read, padding?
    image.compressionType = view.getUint32()
    image.alphaLen = view.getUint32()
    image.positionX = view.getUint32()
    image.positionY = view.getUint32()

    return image
}

// Based on https://github.com/mysliwy112/AM-transcoder/blob/master/src/image.cpp
const convertToRgba32 = (bytes: Uint8Array) => {
    const rgb = new Uint8Array(bytes.byteLength / 2 * 3)

    let counter = 0
    for (let i = 0; i < bytes.byteLength; i += 2) {
        let temp = bytes[i] + bytes[i + 1] * 256

        rgb[counter + 2] = (temp % 32) * 8
        temp /= 32

        rgb[counter + 1] = (temp % 64) * 4
        temp /= 64

        rgb[counter] = (temp % 32) * 8
        counter += 3
    }

    return rgb
}

// Based on https://github.com/mysliwy112/AM-transcoder/blob/master/src/image.cpp
const addAlpha = (imgBytes: Uint8Array, alphaBytes: Uint8Array | undefined) => {
    const output = new Uint8Array(imgBytes.byteLength + imgBytes.byteLength / 3)
    let alphaPosition = 0
    let colorPosition = 0

    for (let i = 0; i < output.byteLength; i += 4) {
        output[i] = imgBytes[colorPosition]
        output[i+1] = imgBytes[colorPosition+1]
        output[i+2] = imgBytes[colorPosition+2]
        if (alphaBytes == undefined || alphaBytes.byteLength == 0) {
            output[i+3] = 255
        } else {
            output[i+3] = alphaBytes[alphaPosition]
        }
        colorPosition += 3
        alphaPosition++
    }

    return output
}

export const loadImage = (data: ArrayBuffer): Image => {
    const buffer = new BinaryBuffer(new DataView(data))
    const header = parseHeader(buffer)

    if (header.bpp === 2) {
        header.bpp = 15
    } else if (header.bpp === 4) {
        header.bpp = 16
    } else if (header.bpp === 8) {
        header.bpp = 24
    }

    const decompressedImageLen = header.width * header.height * 2
    const decompressedAlphaLen = header.alphaLen ? header.width * header.height : 0
    const imgBytes = loadImageWithoutHeader(buffer, header.compressionType, header.imageLen, decompressedImageLen, header.alphaLen, decompressedAlphaLen)
    return {
        header,
        bytes: imgBytes
    }
}

export const loadImageWithoutHeader = (buffer: BinaryBuffer, compressionType: number, imageLen: number, decompressedImageLen: number, alphaLen: number, decompressedAlphaLen: number) => {
    let imgBytes
    let alphaBytes
    if (compressionType == CompressionType.CLZW) {
        imgBytes = new Uint8Array(CLZWDecompress(buffer))
        if (alphaLen !== 0) {
            alphaBytes = new Uint8Array(CLZWDecompress(buffer))
        }
    } else if (compressionType == CompressionType.CRLE) {
        const imgBuffer = new BinaryBuffer(new DataView(buffer.read(imageLen)))
        imgBytes = new Uint8Array(CRLEDecompress(imgBuffer, decompressedImageLen, 2))

        if (alphaLen !== 0) {
            const alphaBuffer = new BinaryBuffer(new DataView(buffer.read(alphaLen)))
            alphaBytes = new Uint8Array(CRLEDecompress(alphaBuffer, decompressedAlphaLen, 1))
        }
    } else if (compressionType == CompressionType.CLZW_CRLE) {
        imgBytes = CLZWDecompress(buffer)
        const imgBuffer = new BinaryBuffer(new DataView(imgBytes))
        imgBytes = new Uint8Array(CRLEDecompress(imgBuffer, decompressedImageLen, 2))

        if (alphaLen !== 0) {
            alphaBytes = CLZWDecompress(buffer)
            const alphaBuffer = new BinaryBuffer(new DataView(alphaBytes))
            alphaBytes = new Uint8Array(CRLEDecompress(alphaBuffer, decompressedAlphaLen, 1))
        }
    } else if (compressionType == CompressionType.NONE) {
        imgBytes = new Uint8Array(buffer.read(imageLen))
        if (alphaLen !== 0) {
            alphaBytes = new Uint8Array(buffer.read(alphaLen))
        }
    } else {
        throw new Error(`Unknown compression type ${compressionType}`)
    }

    imgBytes = convertToRgba32(imgBytes)
    imgBytes = addAlpha(imgBytes, alphaBytes)
    return imgBytes
}

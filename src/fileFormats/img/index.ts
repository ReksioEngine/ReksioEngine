import {BinaryBuffer} from '../utils'
import {decompress as CLZWDecompress} from '../compression/clzw'
import {decompress as CRLEDecompress} from '../compression/crle'
import {CompressionType} from '../compression'

export interface CompressedImageHeader {
    compressionType: number
    width: number
    height: number
    imageLen: number
    alphaLen: number
}

interface ImageHeader extends CompressedImageHeader {
    bpp: number
    positionX: number
    positionY: number
}

export interface Image {
    header: ImageHeader
    bytes: ArrayBuffer
}

export interface CompressionDescriptor {
    compressionType: CompressionType
    compressedLen: number
    decompressedLen: number
    pixelLen: number
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
        output[i+1] = imgBytes[colorPosition + 1]
        output[i+2] = imgBytes[colorPosition + 2]
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

    const { colorDescriptor, alphaDescriptor } = createDescriptors(header, {
        0: [CompressionType.NONE, CompressionType.NONE],
        2: [CompressionType.CLZW, CompressionType.CLZW],
        4: [CompressionType.NONE, CompressionType.NONE],
        5: [CompressionType.JPEG, CompressionType.CLZW],
    })
    const imgBytes = loadImageWithoutHeader(buffer, colorDescriptor, alphaDescriptor)
    return {
        header,
        bytes: imgBytes
    }
}

export const createDescriptors = (header: CompressedImageHeader, mapping: { [compressionType: number]: [CompressionType, CompressionType] }) => {
    if (!(header.compressionType in mapping)) {
        throw new Error(`Unsupported compression type: ${header.compressionType}`)
    }

    const [colorCompressionType, alphaCompressionType] = mapping[header.compressionType]
    const [colorPixelLen, alphaPixelLen] = [2, 1]

    const colorDescriptor: CompressionDescriptor = {
        compressionType: colorCompressionType,
        compressedLen: header.imageLen,
        decompressedLen: header.width * header.height * colorPixelLen,
        pixelLen: colorPixelLen,
    }
    const alphaDescriptor: CompressionDescriptor | undefined = (header.alphaLen > 0) ? {
        compressionType: alphaCompressionType,
        compressedLen: header.alphaLen,
        decompressedLen: header.width * header.height * alphaPixelLen,
        pixelLen: alphaPixelLen,
    } : undefined

    return { colorDescriptor, alphaDescriptor }
}

export const loadImageWithoutHeader = (buffer: BinaryBuffer, colorCompression: CompressionDescriptor, alphaCompression?: CompressionDescriptor) => {
    const colorBytes = decompressImageData(buffer, colorCompression)
    const alphaBytes = (alphaCompression !== undefined) ? decompressImageData(buffer, alphaCompression) : undefined

    let imageBytes = convertToRgba32(colorBytes)
    imageBytes = addAlpha(imageBytes, alphaBytes)
    return imageBytes
}

const decompressImageData = (buffer: BinaryBuffer, descriptor: CompressionDescriptor) => {
    switch (descriptor.compressionType) {
    case CompressionType.NONE:
        return new Uint8Array(buffer.read(descriptor.compressedLen))
    case CompressionType.CLZW:
        return new Uint8Array(CLZWDecompress(buffer))
    case CompressionType.CRLE:
        return new Uint8Array(CRLEDecompress(new BinaryBuffer(new DataView(buffer.read(descriptor.compressedLen))), descriptor.decompressedLen, descriptor.pixelLen))
    case CompressionType.CLZW_IN_CRLE:
        return new Uint8Array(CRLEDecompress(new BinaryBuffer(new DataView(CLZWDecompress(buffer))), descriptor.decompressedLen, descriptor.pixelLen))
    case CompressionType.JPEG:
        throw new Error(`Unsupported compression type: ${descriptor.compressionType}`)
    default:
        throw new Error(`Unknown compression type: ${descriptor.compressionType}`)
    }
}

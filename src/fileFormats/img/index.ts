import { BinaryBuffer } from '../utils'
import { decompressCLZW as CLZWDecompress } from '../compression/clzw'
import { decompressCRLE as CRLEDecompress } from '../compression/crle'
import { CompressionType } from '../compression'

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

export const buildImage = (header: ImageHeader, rgbaData: any) => {
    const rgb = extractRgb565(rgbaData)
    const alpha = extractAlphaChannel(rgbaData)

    const raw = new Uint8Array(40 + rgb.byteLength + alpha.byteLength).buffer
    const buffer = new BinaryBuffer(new DataView(raw))
    buffer.setUint32(0x4b4950)
    buffer.setUint32(header.width)
    buffer.setUint32(header.height)
    buffer.setUint32(header.bpp)
    buffer.setUint32(rgb.byteLength)
    buffer.setUint32(0)
    buffer.setUint32(header.compressionType)
    buffer.setUint32(alpha.byteLength)
    buffer.setUint32(header.positionX)
    buffer.setUint32(header.positionY)

    buffer.write(new Uint8Array(rgb.buffer, rgb.byteOffset, rgb.byteLength))
    buffer.write(alpha)

    return raw
}

const extractRgb565 = (data: Uint8ClampedArray) => {
    const nPixels = data.length / 4
    const rgb565 = new Uint16Array(nPixels)

    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        const r5 = (r >> 3) & 0x1f
        const g6 = (g >> 2) & 0x3f
        const b5 = (b >> 3) & 0x1f

        rgb565[j] = (r5 << 11) | (g6 << 5) | b5
    }

    return rgb565
}

const extractAlphaChannel = (data: Uint8ClampedArray) => {
    const nPixels = data.length / 4
    const alpha = new Uint8Array(nPixels)

    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        alpha[j] = data[i + 3]
    }
    return alpha
}

const convertToRgba32 = (bytes: Uint8Array, alphaBytes?: Uint8Array): Uint8Array => {
    const numPixels = bytes.byteLength >>> 1
    const rgba = new Uint8Array(numPixels * 4)
    const input16 = new Uint16Array(bytes.buffer, bytes.byteOffset, numPixels)
    const pixels32 = new Uint32Array(rgba.buffer, rgba.byteOffset, numPixels)
    const hasAlphaBytes = alphaBytes && alphaBytes.length > 0
    for (let i = 0; i < numPixels; i++) {
        let temp = input16[i]
        const b = (temp & 0x1f) << 3
        temp >>>= 5
        const g = (temp & 0x3f) << 2
        temp >>>= 6
        const r = (temp & 0x1f) << 3
        const a = hasAlphaBytes ? alphaBytes![i] : 255
        pixels32[i] = r | (g << 8) | (b << 16) | (a << 24)
    }
    return rgba
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
        bytes: imgBytes,
    }
}

export const createDescriptors = (
    header: CompressedImageHeader,
    mapping: { [compressionType: number]: [CompressionType, CompressionType] }
) => {
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
    const alphaDescriptor: CompressionDescriptor | undefined =
        header.alphaLen > 0
            ? {
                  compressionType: alphaCompressionType,
                  compressedLen: header.alphaLen,
                  decompressedLen: header.width * header.height * alphaPixelLen,
                  pixelLen: alphaPixelLen,
              }
            : undefined

    return { colorDescriptor, alphaDescriptor }
}

export const loadImageWithoutHeader = (
    buffer: BinaryBuffer,
    colorCompression: CompressionDescriptor,
    alphaCompression?: CompressionDescriptor
) => {
    const colorBytes = decompressImageData(buffer, colorCompression)
    const alphaBytes = alphaCompression !== undefined ? decompressImageData(buffer, alphaCompression) : undefined

    return convertToRgba32(colorBytes, alphaBytes)
}

const decompressImageData = (buffer: BinaryBuffer, descriptor: CompressionDescriptor) => {
    switch (descriptor.compressionType) {
        case CompressionType.NONE:
            return new Uint8Array(buffer.read(descriptor.compressedLen))
        case CompressionType.CLZW:
            return new Uint8Array(CLZWDecompress(buffer))
        case CompressionType.CRLE:
            return new Uint8Array(
                CRLEDecompress(
                    new BinaryBuffer(new DataView(buffer.read(descriptor.compressedLen))),
                    descriptor.decompressedLen,
                    descriptor.pixelLen
                )
            )
        case CompressionType.CLZW_IN_CRLE:
            return new Uint8Array(
                CRLEDecompress(
                    new BinaryBuffer(new DataView(CLZWDecompress(buffer))),
                    descriptor.decompressedLen,
                    descriptor.pixelLen
                )
            )
        case CompressionType.JPEG:
            throw new Error(`Unsupported compression type: ${descriptor.compressionType}`)
        default:
            throw new Error(`Unknown compression type: ${descriptor.compressionType}`)
    }
}

import { BinaryBuffer } from '../utils'
import { CompressedImageHeader, createDescriptors, loadImageWithoutHeader } from '../img'
import { CompressionType } from '../compression'
import { stringUntilNull } from '../../utils'

const decoder = new TextDecoder()

interface AnnHeader {
    framesCount: number
    bpp: number
    eventsCount: number
    fps: number
    flags: number
    transparency: number
    randomFramesNumber: number
    author: string
    description: string
}

export interface Event {
    name: string
    framesCount: number
    loopNumber: number
    transparency: number

    framesImageMapping: Array<number>
    frames: Array<Frame>
}

export interface Frame {
    positionX: number
    positionY: number
    hasSounds: number
    transparency: number
    name: string
    sounds: string[]
}

export interface AnnImage extends CompressedImageHeader {
    positionX: number
    positionY: number
    name: string
}

export interface ANN {
    header: AnnHeader
    events: Event[]
    images: Uint8Array[]
    annImages: AnnImage[]
}

const parseHeader = (view: BinaryBuffer) => {
    const magic = view.getUint32()
    if (magic != 0x50564e) {
        throw new Error('Not an image')
    }

    const ann = {} as AnnHeader
    ann.framesCount = view.getUint16()
    ann.bpp = view.getUint16()
    ann.eventsCount = view.getUint16()
    view.skip(0xd)
    ann.fps = view.getUint32()
    ann.flags = view.getUint32()
    ann.transparency = view.getUint8()
    ann.randomFramesNumber = view.getUint16()
    view.skip(0xa)

    const authorLen = view.getUint32()
    ann.author = decoder.decode(view.read(authorLen))

    const descriptionLen = view.getUint32()
    ann.description = decoder.decode(view.read(descriptionLen))

    return ann
}

const parseFrame = (view: BinaryBuffer) => {
    const frame = {} as Frame
    view.skip(4)
    view.skip(4)
    frame.positionX = view.getInt16()
    frame.positionY = view.getInt16()
    view.skip(4)
    frame.hasSounds = view.getUint32()
    view.skip(4)
    frame.transparency = view.getUint8()
    view.skip(5)

    const nameSize = view.getUint32()
    frame.name = stringUntilNull(decoder.decode(view.read(nameSize)))

    if (frame.hasSounds != 0) {
        const soundsLen = view.getUint32()
        frame.sounds = stringUntilNull(decoder.decode(view.read(soundsLen)))
            .split(';')
            .filter((x) => x.trim() !== '')
    }

    return frame
}

const parseEvent = (view: BinaryBuffer) => {
    const event = {} as Event
    event.name = stringUntilNull(decoder.decode(view.read(0x20)))
    event.framesCount = view.getUint16()
    view.skip(0x6)
    event.loopNumber = view.getUint32()
    view.skip(0x4 + 0x6)
    event.transparency = view.getUint8()
    view.skip(0xc)

    event.framesImageMapping = []
    for (let i = 0; i < event.framesCount; i++) {
        event.framesImageMapping.push(view.getUint16())
    }

    event.frames = []
    for (let i = 0; i < event.framesCount; i++) {
        event.frames.push(parseFrame(view))
    }

    return event
}

const parseAnnImage = (view: BinaryBuffer) => {
    const img = {} as AnnImage
    img.width = view.getUint16()
    img.height = view.getUint16()
    img.positionX = view.getInt16()
    img.positionY = view.getInt16()
    img.compressionType = view.getUint16()
    img.imageLen = view.getUint32()

    const someDataLen = view.getUint16() // some size, happens to be 4
    view.read(someDataLen) // some data, the size is for data here
    view.skip(12 - someDataLen)

    img.alphaLen = view.getUint32()
    img.name = stringUntilNull(decoder.decode(view.read(0x14)))

    return img
}

export const loadAnn = (data: ArrayBuffer) => {
    const buffer = new BinaryBuffer(new DataView(data))
    const header = parseHeader(buffer)

    const events: Event[] = []
    for (let i = 0; i < header.eventsCount; i++) {
        events.push(parseEvent(buffer))
    }

    const annImages = []
    for (let i = 0; i < header.framesCount; i++) {
        annImages.push(parseAnnImage(buffer))
    }

    const images = []
    for (let i = 0; i < header.framesCount; i++) {
        const img = annImages[i]
        const { colorDescriptor, alphaDescriptor } = createDescriptors(img, {
            0: [CompressionType.NONE, CompressionType.NONE],
            2: [CompressionType.CLZW, CompressionType.CLZW],
            3: [CompressionType.CLZW_IN_CRLE, CompressionType.CLZW_IN_CRLE],
            4: [CompressionType.CRLE, CompressionType.CRLE],
        })
        images.push(loadImageWithoutHeader(buffer, colorDescriptor, alphaDescriptor))
    }

    return {
        header,
        events,
        images,
        annImages,
    } as ANN
}

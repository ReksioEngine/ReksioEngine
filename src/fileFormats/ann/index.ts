import { BinaryBuffer, stringUntilNull } from '../utils'
import { CompressedImageHeader, createDescriptors, loadImageWithoutHeader } from '../img'
import { CompressionType } from '../compression'

const decoder = new TextDecoder()

export enum AnimoFlags {
    NEXT_EVENT_AT_END = 0x800000,
    STREAM_SOUNDS = 0x400000,
    NO_INTERRUPT = 0x40000, // can't be interrupted by PLAY
}

export enum EventFlags {
    PING_PONG = 0x20000,
    LOOP_WHILE_SOUND = 0x100000,
    NO_INTERRUPT = 0x40000, // can't be interrupted by PLAY
}

export interface AnnHeader {
    framesCount: number
    bpp: number
    eventsCount: number
    sfxBankFileName: string // e.g. game1.sfx
    fps: number
    flags: AnimoFlags
    transparency: number
    randomFramesNumber: number
    author: string
    description: string
}

export interface Event {
    name: string
    framesCount: number
    loopFramesStartIndex: number
    loopFramesEndIndex: number
    loopRepeatsCount: number // 0 = loop forever
    fps: number // not used?
    flags: EventFlags
    transparency: number

    framesImageMapping: number[]
    frames: Frame[]
}

export interface Frame {
    hasName: number
    hasExtraString: number
    positionX: number
    positionY: number
    hasSounds: number
    transparency: number
    name: string
    extraString: string
    sounds: string[]
}

export interface AnnImage extends CompressedImageHeader {
    positionX: number
    positionY: number
    channelsCount: number // game files have 4
    channelSizes: number[] // rgba? only alpha is used
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
    if (magic !== 0x50564e) {
        throw new Error('Not an image')
    }

    const ann = {} as AnnHeader
    ann.framesCount = view.getUint16()
    ann.bpp = view.getUint16()
    ann.eventsCount = view.getUint16()
    ann.sfxBankFileName = stringUntilNull(decoder.decode(view.read(0xd)))
    ann.fps = view.getUint32()
    ann.flags = view.getUint32()
    ann.transparency = view.getUint8()
    ann.randomFramesNumber = view.getUint16()
    view.skip(0xa) // uninitialized memory

    const authorLen = view.getUint32()
    ann.author = decoder.decode(view.read(authorLen))

    const descriptionLen = view.getUint32()
    ann.description = decoder.decode(view.read(descriptionLen))

    return ann
}

const parseFrame = (view: BinaryBuffer) => {
    const frame = {} as Frame
    frame.hasName = view.getUint32()
    frame.hasExtraString = view.getUint32()
    frame.positionX = view.getInt16()
    frame.positionY = view.getInt16()
    view.skip(4) // always -1
    frame.hasSounds = view.getUint32()
    view.skip(4) // unused?
    frame.transparency = view.getUint8()
    view.getUint8() // unused?
    view.getUint32() // unused?

    if (frame.hasName !== 0) {
        const nameSize = view.getUint32()
        frame.name = stringUntilNull(decoder.decode(view.read(nameSize)))
    } else {
        frame.name = ''
    }

    if (frame.hasExtraString !== 0) {
        const extraSize = view.getUint32()
        frame.extraString = stringUntilNull(decoder.decode(view.read(extraSize)))
    } else {
        frame.extraString = ''
    }

    if (frame.hasSounds !== 0) {
        const soundsLen = view.getUint32()
        frame.sounds = stringUntilNull(decoder.decode(view.read(soundsLen)))
            .split(';')
            .filter((x) => x.trim() !== '')
    } else {
        frame.sounds = []
    }

    return frame
}

const parseEvent = (view: BinaryBuffer) => {
    const event = {} as Event
    event.name = stringUntilNull(decoder.decode(view.read(0x20)))
    event.framesCount = view.getUint16()
    view.getUint32() // pointer to the frame mapping, runtime only
    event.loopFramesStartIndex = view.getUint16()
    event.loopFramesEndIndex = view.getUint16()
    event.loopRepeatsCount = view.getUint16()
    view.getUint16() // counter of the loops done, runtime value
    event.fps = view.getUint32()
    event.flags = view.getUint32()
    event.transparency = view.getUint8()
    view.skip(0xc) // unused

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
    img.channelsCount = view.getUint16()
    img.channelSizes = []
    for (let i = 0; i < 4; i++) {
        img.channelSizes.push(view.getUint32())
    }
    img.alphaLen = img.channelSizes[3]
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

    const annImages: AnnImage[] = []
    for (let i = 0; i < header.framesCount; i++) {
        annImages.push(parseAnnImage(buffer))
    }

    const images: Uint8Array[] = []
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

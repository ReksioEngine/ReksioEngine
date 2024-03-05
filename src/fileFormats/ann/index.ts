import {BinaryBuffer} from '../utils'
import {loadImageWithoutHeader} from '../img'
import {stringUntilNull} from '../../utils'

const decoder = new TextDecoder()

interface AnnHeader {
    framesCount: number
    bpp: number
    eventsCount: number
    fps: number
    flags: number
    transparency: number
    authorLen: number
    author: string
    descriptionLen: number
    description: string
}

interface Event {
    name: string
    framesCount: number
    loopNumber: number
    transparency: number

    framesImageMapping: Array<number>
    frames: Array<Frame>
}

interface Frame {
    check: string
    positionX: number
    positionY: number
    sfxSwitch: number
    transparency: number
    nameSize: number
    name: string
    sfxSize: number
    sounds: string
}

interface AnnImage {
    width: number
    height: number
    positionX: number
    positionY: number
    compression: number
    imageLen: number
    alphaLen: number
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
    view.skip(0xD)
    ann.fps = view.getUint32()
    ann.flags = view.getUint32()
    ann.transparency = view.getUint8()
    view.skip(0xC)
    ann.authorLen = view.getUint32()
    ann.author = decoder.decode(view.read(ann.authorLen))
    ann.descriptionLen = view.getUint32()
    ann.description = decoder.decode(view.read(ann.descriptionLen))

    return ann
}

const parseFrame = (view: BinaryBuffer) => {
    const frame = {} as Frame
    frame.check = decoder.decode(view.read(4))
    view.skip(4)
    frame.positionX = view.getInt16()
    frame.positionY = view.getInt16()
    view.skip(4)
    frame.sfxSwitch = view.getUint32()
    view.skip(4)
    frame.transparency = view.getUint8()
    view.skip(5)
    frame.nameSize = view.getUint32()
    frame.name = decoder.decode(view.read(frame.nameSize))

    if (frame.sfxSwitch != 0) {
        frame.sfxSize = view.getUint32()
        frame.sounds = stringUntilNull(decoder.decode(view.read(frame.sfxSize)))
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
    view.skip(0xC)

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
    img.positionX = view.getUint16()
    img.positionY = view.getUint16()
    img.compression = view.getUint16()
    img.imageLen = view.getUint32()
    view.skip(4 + 0xA)
    img.alphaLen = view.getUint32()
    img.name = stringUntilNull(decoder.decode(view.read(0x14)))

    return img
}

export const loadAnn = (data: ArrayBuffer) => {
    const buffer = new BinaryBuffer(new DataView(data))
    const header = parseHeader(buffer)

    const events = []
    for (let i = 0; i < header.eventsCount; i++) {
        events.push(parseEvent(buffer))
    }

    const annImages = []
    for (let i = 0; i < header.framesCount; i++) {
        annImages.push(parseAnnImage(buffer))
    }

    const images = []
    for (let i = 0; i < header.framesCount; i++) {
        images.push(loadImageWithoutHeader(buffer, annImages[i].compression, annImages[i].imageLen, annImages[i].alphaLen))
    }

    return {
        header,
        events,
        images,
        annImages
    } as ANN
}

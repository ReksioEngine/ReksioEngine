const textDecoder = new TextDecoder('utf-8')

const HEADER_PATTERN = /{<(?<direction>[cCdD]):(?<movement>\d+)>}/
const CR = '\r'.charCodeAt(0)
const NL = '\n'.charCodeAt(0)

type Direction = 'C' | 'd'
type Header = {
    length: number
    direction: Direction
    movement: number
}

const parseHeader = (content: string): Header | null => {
    const match = HEADER_PATTERN.exec(content)
    if (match == null || match.groups === undefined) {
        return null
    }

    const { direction, movement } = match.groups
    return {
        length: match[0].length,
        direction: direction as Direction,
        movement: parseInt(movement, 10),
    }
}

const calcShift = (step: number, movement: number): { step: number; shift: number } => {
    const newStep = (step % movement) + 1
    const currentShift = Math.ceil(newStep / 2)
    const isOddStep = newStep % 2 !== 0
    const finalShift = isOddStep ? -currentShift : currentShift
    return {
        step: newStep,
        shift: finalShift,
    }
}

export const decryptCNV = (content: ArrayBuffer): string => {
    const contentText = textDecoder.decode(content)
    const header = parseHeader(contentText)
    if (header === null) {
        return contentText.replaceAll('\r\n', '\n')
    }

    const { length, direction, movement } = header
    const directionMultiplier = direction.toLowerCase() === 'd' ? -1 : 1
    const payload = new Uint8Array(content.slice(length))

    let output = ''
    let step = 0
    let shift = 0

    for (let pos = 0; pos < payload.byteLength; pos++) {
        if (
            payload[pos] === '<'.charCodeAt(0) &&
            payload[pos + 1] === 'E'.charCodeAt(0) &&
            payload[pos + 2] === '>'.charCodeAt(0)
        ) {
            output += '\n'
            pos += 2
        } else if (payload[pos] !== CR && payload[pos] !== NL) {
            const newShift = calcShift(step, movement)
            step = newShift.step
            shift = newShift.shift

            output += String.fromCharCode(payload[pos] + ((shift * directionMultiplier) % 256))
        }
    }

    return output
}

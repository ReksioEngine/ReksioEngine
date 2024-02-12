const textDecoder = new TextDecoder('utf-8')

const parseHeader = (content: ArrayBuffer) => {
    const contentText = textDecoder.decode(content)
    const match = /{<(?<direction>[cCdD]):(?<movement>\d+)>}/.exec(contentText)
    if (match == null || match.groups === undefined) {
        throw new Error('Failed to parse encrypted file header')
    }

    const {direction, movement} = match.groups
    return {
        length: match[0].length,
        direction,
        movement: parseInt(movement, 10)
    }
}

const calcShift = (step: number, movement: number) => {
    step += 1
    if (step > movement) {
        step = 1
    }
    let shift = (Math.floor(step / 2) + step % 2)
    if (step % 2) {
        shift *= -1
    }
    return {
        step, shift
    }
}

export const decryptCNV = (content: ArrayBuffer): string => {
    const {
        length,
        direction,
        movement
    } = parseHeader(content)

    const directionMultiplier = (direction.toLowerCase() === 'd') ? -1 : 1
    const payload = new Uint8Array(content.slice(length))

    let output = ''
    let step = 0
    let shift = 0

    for (let pos = 0; pos < payload.byteLength; pos++) {
        if (payload[pos] === '<'.charCodeAt(0) && payload[pos + 1] === 'E'.charCodeAt(0) && payload[pos + 2] === '>'.charCodeAt(0)) {
            output += '\n'
            pos += 2
        } else if (payload[pos] !== '\r'.charCodeAt(0) && payload[pos] !== '\n'.charCodeAt(0)) {
            const newShift = calcShift(step, movement)
            step = newShift.step
            shift = newShift.shift

            output += String.fromCharCode(payload[pos] + (shift * directionMultiplier) % 256)
        }
    }

    return output
}

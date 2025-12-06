import { BinaryBuffer } from '../utils'

const decoder = new TextDecoder('windows-1250')
const encoder = new TextEncoder()

enum ValueType {
    INTEGER = 1,
    FLOAT = 4,
    STRING = 2,
    BOOLEAN = 3,
}

export const deserializeArray = (data: ArrayBuffer) => {
    const buffer = new BinaryBuffer(new DataView(data))
    const count = buffer.getUint32()

    const entries = []
    for (let i = 0; i < count; ++i) {
        const type = buffer.getUint32()

        switch (type) {
            case ValueType.INTEGER:
                entries.push(buffer.getInt32())
                break
            case ValueType.STRING: {
                const length = buffer.getUint32()
                entries.push(decoder.decode(buffer.read(length)))
                break
            }
            case ValueType.BOOLEAN:
                entries.push(buffer.getUint32() === 1)
                break
            case ValueType.FLOAT:
                entries.push(buffer.getInt32() / 1000)
                break
        }
    }
    return entries
}

export const serializeArray = (data: any[]) => {
    let tempBuffer = new Uint8Array(4096)
    let buffer = new BinaryBuffer(new DataView(tempBuffer.buffer))
    let size = 0

    buffer.setUint32(data.length)
    size += 4

    const ensureCapacity = (extraBytesCount: number) => {
        const requiredSize = size + extraBytesCount
        if (requiredSize > tempBuffer.byteLength) {
            const newSize = Math.max(tempBuffer.byteLength * 2, requiredSize)
            const newBuffer = new Uint8Array(newSize)
            newBuffer.set(tempBuffer)
            tempBuffer = newBuffer
            buffer = new BinaryBuffer(new DataView(tempBuffer.buffer))
        }
        size = requiredSize
    }

    for (const entry of data) {
        const entryType = typeof entry

        if (entryType === 'number') {
            ensureCapacity(4 + 4)

            if (Number.isInteger(entry)) {
                // integer
                buffer.setUint32(ValueType.INTEGER)
                buffer.setInt32(entry)
            } else {
                // float
                buffer.setUint32(ValueType.FLOAT)
                buffer.setInt32(Math.floor(entry * 1000))
            }
        } else if (entryType === 'string') {
            ensureCapacity(4 + 4 + entry.length)

            buffer.setUint32(ValueType.STRING)
            buffer.setUint32(entry.length)
            buffer.write(encoder.encode(entry))
        } else if (entryType === 'boolean') {
            ensureCapacity(4 + 4)

            buffer.setUint32(ValueType.BOOLEAN)
            buffer.setUint32(Number(entry))
        }
    }

    const result = new Uint8Array(size)
    result.set(tempBuffer.slice(0, size))
    return result.buffer
}

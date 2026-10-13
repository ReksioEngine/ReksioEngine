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

const checkInt32 = (value: number) => {
    if (!Number.isInteger(value) || value < -0x80000000 || value > 0x7fffffff) {
        throw new RangeError(`Value ${value} cannot be serialized as a 32-bit integer`)
    }
    return value
}

export const serializeArray = (data: any[]) => {
    // Strings are pre-encoded so that we know their sizes up front
    const entries = data.map((entry) => (typeof entry === 'string' ? encoder.encode(entry) : entry))

    let size = 4
    for (const entry of entries) {
        if (entry instanceof Uint8Array) {
            size += 4 + 4 + entry.length
        } else if (typeof entry === 'number' || typeof entry === 'boolean') {
            size += 4 + 4
        } else {
            throw new TypeError(`Cannot serialize value of type ${typeof entry} in array`)
        }
    }

    const result = new Uint8Array(size)
    const buffer = new BinaryBuffer(new DataView(result.buffer))
    buffer.setUint32(entries.length)

    for (const entry of entries) {
        if (entry instanceof Uint8Array) {
            buffer.setUint32(ValueType.STRING)
            buffer.setUint32(entry.length)
            buffer.write(entry)
        } else if (typeof entry === 'boolean') {
            buffer.setUint32(ValueType.BOOLEAN)
            buffer.setUint32(Number(entry))
        } else if (Number.isInteger(entry)) {
            buffer.setUint32(ValueType.INTEGER)
            buffer.setInt32(checkInt32(entry))
        } else {
            buffer.setUint32(ValueType.FLOAT)
            buffer.setInt32(checkInt32(Math.trunc(entry * 1000)))
        }
    }

    return result.buffer
}

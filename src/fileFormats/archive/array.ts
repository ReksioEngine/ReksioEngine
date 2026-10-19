import { BinaryBuffer } from '../utils'

const decoder = new TextDecoder('windows-1250')
const encoder = new TextEncoder()

export enum ArrayEntryType {
    INTEGER = 1,
    FLOAT = 4,
    STRING = 2,
    BOOLEAN = 3,
}

export type ArrayEntry =
    | { type: ArrayEntryType.INTEGER | ArrayEntryType.FLOAT; value: number }
    | { type: ArrayEntryType.STRING; value: string }
    | { type: ArrayEntryType.BOOLEAN; value: boolean }

export const deserializeArray = (data: ArrayBuffer) => {
    const buffer = new BinaryBuffer(new DataView(data))
    const count = buffer.getUint32()

    const entries: ArrayEntry[] = []
    for (let i = 0; i < count; ++i) {
        const type = buffer.getUint32()

        switch (type) {
            case ArrayEntryType.INTEGER:
                entries.push({ type, value: buffer.getInt32() })
                break
            case ArrayEntryType.STRING: {
                const length = buffer.getUint32()
                entries.push({ type, value: decoder.decode(buffer.read(length)) })
                break
            }
            case ArrayEntryType.BOOLEAN:
                entries.push({ type, value: buffer.getUint32() === 1 })
                break
            case ArrayEntryType.FLOAT:
                entries.push({ type, value: buffer.getInt32() / 1000 })
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

export const serializeArray = (entries: ArrayEntry[]) => {
    // Strings are pre-encoded so that we know their sizes up front
    const encoded = entries.map((entry) => (entry.type === ArrayEntryType.STRING ? encoder.encode(entry.value) : null))

    let size = 4
    for (const bytes of encoded) {
        size += 4 + 4 + (bytes?.length ?? 0)
    }

    const result = new Uint8Array(size)
    const buffer = new BinaryBuffer(new DataView(result.buffer))
    buffer.setUint32(entries.length)

    entries.forEach((entry, i) => {
        buffer.setUint32(entry.type)
        switch (entry.type) {
            case ArrayEntryType.STRING:
                buffer.setUint32(encoded[i]!.length)
                buffer.write(encoded[i]!)
                break
            case ArrayEntryType.BOOLEAN:
                buffer.setUint32(Number(entry.value))
                break
            case ArrayEntryType.INTEGER:
                buffer.setInt32(checkInt32(entry.value))
                break
            case ArrayEntryType.FLOAT:
                buffer.setInt32(checkInt32(Math.trunc(entry.value * 1000)))
                break
        }
    })

    return result.buffer
}

import { BinaryBuffer } from '../utils'

const decoder = new TextDecoder('windows-1250')

export const deserialize = (buffer: BinaryBuffer) => {
    const type = buffer.getUint32()

    switch (type) {
        case 1:
            return buffer.getInt32()
        case 2: {
            const length = buffer.getUint32()
            return decoder.decode(buffer.read(length))
        }
        case 3:
            return buffer.getUint32() === 1
        case 4:
            return buffer.getInt32() * 0.001
    }
}

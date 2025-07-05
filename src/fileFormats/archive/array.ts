import { BinaryBuffer } from '../utils'
import { deserialize } from './index'

export const parseArray = (data: ArrayBuffer) => {
    const buffer = new BinaryBuffer(new DataView(data))
    const count = buffer.getUint32()

    const entries = []
    for (let i = 0; i < count; ++i) {
        entries.push(deserialize(buffer))
    }
    return entries
}

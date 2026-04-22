import { BinaryBuffer } from '../utils'
import { LZO } from 'lzo-ts'

export const decompressCLZW = (buffer: BinaryBuffer) => {
    const uncompressedSize = buffer.getUint32()
    const compressedSize = buffer.getUint32()

    return LZO.decompress(new Uint8Array(buffer.read(compressedSize))).buffer
}

import {BinaryBuffer} from '../utils'

export const decompress = (input: BinaryBuffer, decompressedSize: number, bulk: number = 1): Uint8Array => {
    const output = new Uint8Array(decompressedSize)
    let outputPosition = 0

    while (outputPosition < decompressedSize) {
        const count = input.getUint8()
        if (count < 128) {
            for (let i = 0; i < count * bulk; i++) {
                output[outputPosition++] = input.getUint8()
            }
        } else {
            const repeated = new Array(bulk)
            for (let i = 0; i < bulk; i++) {
                repeated[i] = input.getUint8()
            }
            for (let i = 0; i < (count & 0x7f); i++) {
                for (let j = 0; j < bulk; j++) {
                    output[outputPosition++] = repeated[j]
                }
            }
        }
    }

    return output
}

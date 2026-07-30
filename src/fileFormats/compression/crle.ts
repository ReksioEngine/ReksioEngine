import { BinaryBuffer } from '../utils'

export const decompressCRLE = (input: BinaryBuffer, decompressedSize: number, bulk: number = 1): Uint8Array => {
    const output = new Uint8Array(decompressedSize)
    const src = new Uint8Array(input.view.buffer)
    let sp = input.offset
    let dp = 0

    const repeated = new Uint8Array(bulk)

    while (dp < decompressedSize) {
        const count = src[sp++]
        if (count < 128) {
            const bytes = count * bulk
            output.set(src.subarray(sp, sp + bytes), dp)
            sp += bytes
            dp += bytes
        } else {
            repeated.set(src.subarray(sp, sp + bulk))
            sp += bulk
            const len = count & 0x7F
            for (let i = 0; i < len; i++) {
                output.set(repeated, dp)
                dp += bulk
            }
        }
    }

    input.offset = sp
    return output
}

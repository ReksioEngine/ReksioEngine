import {BinaryBuffer} from '../utils'

export const decompress = (buffer: BinaryBuffer) => {
    const uncompressedSize = buffer.getUint32()
    const compressedSize = buffer.getUint32()

    const srcBuffer = buffer.read(compressedSize)
    const src = new BinaryBuffer(new DataView(srcBuffer))

    const dstRaw = new ArrayBuffer(uncompressedSize)
    const dst = new BinaryBuffer(new DataView(dstRaw))

    if (src.getUint8(false) > 0x11) {
        for (let i = 0; i < src.getUint8() - 0x11; i++) {
            dst.setUint8(src.getUint8())
        }
    }

    while (src.offset < src.size) {
        let tag = src.getUint8()

        if (tag < 0x10) {
            if (tag == 0) {
                while (src.getUint8(false) == 0) {
                    tag += 0xff
                    src.skip(1)
                }

                tag += src.getUint8() + 0xf
            }

            for (let i = 0; i < 4 + tag - 1; i++) {
                dst.setUint8(src.getUint8())
            }

            continue
        }

        let edi_4: BinaryBuffer = dst
        let count = 0

        if (tag < 0x40) {
            if (tag < 0x20) {
                if (tag >= 0x10) {
                    // let edi_10 = dst.offset - ((tag & 0b1000) << 0xb);
                    const edi_10 = dst.ptr(-((tag & 0b1000) << 0xb))
                    count = tag & 7
                    if (count == 0) {
                        while (src.getUint8(false) == 0) {
                            src.skip(1)
                            count += 0xff
                        }

                        count += src.getUint8() + 7
                    }

                    const edi_11 = edi_10.ptr(-(src.getUint16() >> 2))
                    if (edi_11.offset == dst.offset) {
                        // const dstLen = dst.offset

                        if (src.offset != src.size) {
                            throw new Error('Decompression ended, but there is still data left')
                            // return ((-(src.offset < src.size)) & 0b11111100) - 4;
                        } else {
                            return dst.buffer()
                        }
                    }

                    edi_4 = edi_11.ptr(-0x4000)
                }
            } else {
                count = tag & 0b11111
                if (count == 0) {
                    while (src.getUint8(false) == 0) {
                        src.skip(1)
                        count += 0xff
                    }

                    count += src.getUint8() + 0x1f
                }

                edi_4 = dst.ptr(-(src.getUint16() >> 2) - 1)
            }

            if (count >= 6 && dst.offset - edi_4.offset >= 4) {
                for (let i = 0; i < 4; i++) {
                    dst.setUint8(edi_4.getUint8())
                }
                count -= 2
            } else {
                for (let i = 0; i < 2; i++) {
                    dst.setUint8(edi_4.getUint8())
                }
            }
        } else {
            edi_4 = dst.ptr(-((tag >> 2) & 0b111) - (src.getUint8() << 3) - 1)
            count = (tag >> 5) - 1
            for (let i = 0; i < 2; i++) {
                dst.setUint8(edi_4.getUint8())
            }
        }

        while (count > 0) {
            dst.setUint8(edi_4.getUint8())
            count--
        }

        count = src.ptr(-2).getUint8(false) & 3
        if (count == 0) {
            continue
        }

        while (count > 0) {
            dst.setUint8(src.getUint8())
            count--
        }
    }

    return dst.buffer()
}

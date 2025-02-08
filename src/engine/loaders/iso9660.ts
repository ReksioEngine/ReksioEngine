import { BinaryBuffer } from '../../fileFormats/utils'

export type FileEntry = {
    offset: number
    size: number
}

export class Iso9660Reader {
    private file: File
    private filesMapping: Map<string, FileEntry> = new Map()

    constructor(file: File) {
        this.file = file
    }

    private readAt(offset: number, length: number): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const blob = this.file.slice(offset, offset + length)
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target === null) {
                    reject()
                    return
                }
                resolve(event.target.result as ArrayBuffer)
            }
            reader.readAsArrayBuffer(blob)
        })
    }

    private async bufferAt(offset: number, length: number) {
        const data = await this.readAt(offset, length)
        return new BinaryBuffer(new DataView(data))
    }

    private decodeUTF16BE(arrayBuffer: ArrayBuffer) {
        const view = new DataView(arrayBuffer)
        const swappedBuffer = new Uint8Array(arrayBuffer.byteLength)

        for (let i = 0; i < arrayBuffer.byteLength; i += 2) {
            swappedBuffer[i] = view.getUint8(i + 1) // High byte
            swappedBuffer[i + 1] = view.getUint8(i) // Low byte
        }

        const decoder = new TextDecoder('utf-16le')
        return decoder.decode(swappedBuffer)
    }

    private async processDirectory(position: number, length: number, path: Array<string>): Promise<void> {
        const directory = await this.bufferAt(position * 2048, length)
        while (directory.offset < length) {
            const startOffset = directory.offset

            const directoryRecordLength = directory.getUint8() // Length of Directory Record
            if (directoryRecordLength === 0) {
                // Didn't fit in the sector
                directory.skip(2048 - (startOffset % 2048) - 1)
                continue
            }

            directory.getUint8() // Extended Attribute Record length.
            const locationOfExtent = directory.getUint32() // Location of extent (LBA) in both-endian format.
            directory.getUint32()
            const dataLength = directory.getUint32() // Data length (size of extent) in both-endian format.
            directory.getUint32()
            directory.read(7) // Recording date and time.
            const flags = directory.getUint8() //  	File flags.
            directory.getUint8() // File unit size for files recorded in interleaved mode, zero otherwise.
            directory.getUint8() // Interleave gap size for files recorded in interleaved mode, zero otherwise.
            directory.getUint16() // Volume sequence number - the volume that this extent is recorded on, in 16 bit both-endian format.
            directory.getUint16()
            const identifierLength = directory.getUint8()

            // Get filename
            let name = ''
            if (identifierLength == 1) {
                const value = directory.getUint8()
                if (value === 0) {
                    name = '.'
                } else if (value === 1) {
                    name = '..'
                }
            } else {
                name = this.decodeUTF16BE(directory.read(identifierLength))
            }

            // Padding
            if (identifierLength % 2 === 0) {
                directory.skip(1)
            }

            // Some special space
            const restSize = directoryRecordLength - (directory.offset - startOffset)
            directory.skip(restSize)

            if (name == '.' || name == '..') {
                continue
            }

            // Do something with data
            const isDirectory = (flags & 2) != 0
            if (!isDirectory) {
                name = name.substring(0, name.indexOf(';')) // Remove version
            }

            const fullPathParts = [...path, name]
            const fullPath = fullPathParts.join('/').toLowerCase()

            if (isDirectory) {
                await this.processDirectory(locationOfExtent, dataLength, fullPathParts)
            } else {
                this.filesMapping.set(fullPath, {
                    offset: locationOfExtent * 2048,
                    size: dataLength,
                })
            }
        }
    }

    async load() {
        const rootDirectoryEntry = await this.bufferAt(17 * 2048 + 156, 34)
        rootDirectoryEntry.getUint8() // Length of Directory Record
        rootDirectoryEntry.getUint8() // Extended Attribute Record length
        const rootLocation = rootDirectoryEntry.getUint32() // Location of extent LSB
        rootDirectoryEntry.getUint32() // Location of extent MSB
        const rootLength = rootDirectoryEntry.getUint32() // Data length LSB
        rootDirectoryEntry.getUint32() // Data length MSB

        await this.processDirectory(rootLocation, rootLength, [])
    }

    async getFile(path: string) {
        const entry = this.filesMapping.get(path)
        if (!entry) {
            return null
        }

        return this.readAt(entry.offset, entry.size)
    }

    getListing() {
        return [...this.filesMapping.keys()]
    }
}

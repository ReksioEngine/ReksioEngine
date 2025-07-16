import { BinaryBuffer } from '../fileFormats/utils'

const SECTOR_SIZE = 2048
const JULIET_SECTOR = 17

export type FileEntry = {
    name: string
    location: number
    size: number
    flags: number
}

export abstract class Iso9660Reader {
    private filesMapping: Map<string, FileEntry> = new Map()
    private decoder = new TextDecoder('utf-16le')

    protected abstract readAt(offset: number, length: number): Promise<ArrayBuffer>

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

        return this.decoder.decode(swappedBuffer)
    }

    private readFileName(directory: BinaryBuffer, identifierLength: number): string {
        if (identifierLength === 1) {
            const charCode = directory.getUint8()
            return charCode === 0 ? '.' : charCode === 1 ? '..' : ''
        } else {
            const name = this.decodeUTF16BE(directory.read(identifierLength))
            // Remove version (if present in name)
            const semicolonIndex = name.indexOf(';')
            return semicolonIndex > -1 ? name.substring(0, semicolonIndex) : name
        }
    }

    private async processDirectory(position: number, length: number, path: Array<string>): Promise<void> {
        const directory = await this.bufferAt(position * SECTOR_SIZE, length)
        while (directory.offset < length) {
            const startOffset = directory.offset

            const directoryRecordLength = directory.getUint8() // Length of Directory Record
            if (directoryRecordLength === 0) {
                // Didn't fit in the sector
                directory.skip(SECTOR_SIZE - (startOffset % SECTOR_SIZE) - 1)
                continue
            }

            directory.getUint8()
            const locationOfExtent = directory.getUint32() // LE
            directory.getUint32() // BE
            const dataLength = directory.getUint32() // LE
            directory.getUint32() // BE
            directory.read(7)
            const flags = directory.getUint8() // File flags.
            directory.getUint8()
            directory.getUint8()
            directory.getUint16()
            directory.getUint16()
            const identifierLength = directory.getUint8()

            // Read filename
            const name = this.readFileName(directory, identifierLength)

            // Padding
            if (identifierLength % 2 === 0) {
                directory.skip(1)
            }

            // Some special space
            directory.skip(directoryRecordLength - (directory.offset - startOffset))

            if (name == '.' || name == '..') {
                continue
            }

            // Do something with data
            const fullPathParts = [...path, name]
            const fullPath = fullPathParts.join('/').toLowerCase()

            const isDirectory = (flags & 2) != 0
            if (isDirectory) {
                await this.processDirectory(locationOfExtent, dataLength, fullPathParts)
            } else {
                this.filesMapping.set(fullPath, {
                    location: locationOfExtent * SECTOR_SIZE,
                    size: dataLength,
                    name: fullPath,
                    flags,
                })
            }
        }
    }

    async load() {
        const rootDirectoryEntry = await this.bufferAt(JULIET_SECTOR * SECTOR_SIZE + 156, 34)
        rootDirectoryEntry.getUint8()
        rootDirectoryEntry.getUint8()
        const rootLocation = rootDirectoryEntry.getUint32() // LE
        rootDirectoryEntry.getUint32() // BE
        const rootLength = rootDirectoryEntry.getUint32() // LE
        rootDirectoryEntry.getUint32() // BE

        await this.processDirectory(rootLocation, rootLength, [])
    }

    async getFile(path: string) {
        const entry = this.filesMapping.get(path)
        if (!entry) {
            return null
        }

        return this.readAt(entry.location, entry.size)
    }

    getListing() {
        return [...this.filesMapping.keys()]
    }
}

export class LocalIso9660Reader extends Iso9660Reader {
    protected file: File

    constructor(file: File) {
        super()
        this.file = file
    }

    protected async readAt(offset: number, length: number): Promise<ArrayBuffer> {
        const blob = this.file.slice(offset, offset + length)
        const reader = new FileReader()

        return new Promise<ArrayBuffer>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as ArrayBuffer)
            reader.onerror = () => reject(reader.error)
            reader.readAsArrayBuffer(blob)
        })
    }
}

export class RemoteIso9660Reader extends Iso9660Reader {
    private readonly url: string

    constructor(url: string) {
        super()
        this.url = url
    }

    protected async readAt(offset: number, length: number): Promise<ArrayBuffer> {
        const response = await fetch(this.url, {
            headers: {
                Range: `bytes=${offset}-${offset + length}`,
            },
        })
        return response.arrayBuffer()
    }
}

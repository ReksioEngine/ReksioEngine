import { parseCNV } from '../fileFormats/cnv/parser'
import { parseSequence } from '../fileFormats/seq'
import { loadImage } from '../fileFormats/img'
import { loadAnn } from '../fileFormats/ann'
import { loadFont } from '../fileFormats/fnt'
import { decryptCNV } from '../fileFormats/cnv'
import { deserializeArray } from '../fileFormats/archive/array'
import { FileLoader } from './fileLoader'
import { FileStorage } from './fileStorage'

export const normalizePath = (path: string) => {
    return path.toLowerCase().replace(/\\+/g, '/').replace(/\/+/g, '/').replace(/^\//, '')
}

export const pathJoin = (...parts: Array<string>) => {
    const fixedParts = parts.filter((part) => part !== '').map((part) => part.replace(/\\/g, '/'))
    return normalizePath(fixedParts.join('/'))
}

export default class Filesystem {
    constructor(
        public fileLoader: FileLoader,
        public storage: FileStorage
    ) {}

    async init() {
        await this.fileLoader.init()
        await this.storage.init()
    }

    async getFile(path: string) {
        path = normalizePath(path)
        const storageFile = await this.storage.get(path)
        if (storageFile) {
            return storageFile
        }
        return this.fileLoader.getRawFile(path)
    }

    async hasFile(path: string) {
        path = normalizePath(path)
        if (await this.storage.has(path)) {
            return true
        }
        return this.fileLoader.hasFile(path)
    }

    saveFile(path: string, content: ArrayBuffer) {
        return this.storage.save(normalizePath(path), content)
    }

    async getANNFile(filename: string) {
        const data = await this.getFile(filename)
        return loadAnn(data)
    }

    async getFNTFile(filename: string) {
        const data = await this.getFile(filename)
        return loadFont(data)
    }

    async getCNVFile(filename: string) {
        const data = await this.getFile(filename)
        const text = decryptCNV(data)
        console.debug(filename)
        console.debug(text)
        return parseCNV(text)
    }

    async getSequenceFile(filename: string) {
        const data = await this.getFile(filename)
        const decoder = new TextDecoder()
        const text = decoder.decode(data)
        console.debug(text)
        return parseSequence(text)
    }

    async getIMGFile(filename: string) {
        filename = normalizePath(filename)
        if (!filename.endsWith('.img')) {
            filename = filename + '.img'
        }

        const data = await this.getFile(filename)
        return loadImage(data)
    }

    async getARRFile(filename: string): Promise<any[]> {
        const data = await this.getFile(filename)
        return deserializeArray(data)
    }
}
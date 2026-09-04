import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../../src/engine/logging'
import { normalizePath } from '../../src/filesystem'
import { FileNotFoundError, SimpleFileLoader } from '../../src/filesystem/fileLoader'

export class TestFileLoader extends SimpleFileLoader {
    protected listing: Map<string, string> | null = null

    constructor(private readonly rootDir: string) {
        super()
    }

    async init(): Promise<void> {
        logger.debug('Fetching files listing...')
        this.listing = new Map((await fs.promises.readdir(this.rootDir, { recursive: true })).map((filename: string) => [normalizePath(filename), filename]))
    }

    getFilesListing(): string[] {
        return [...this.listing!.keys()]
    }

    hasFile(filename: string): boolean {
        return this.listing!.has(normalizePath(filename))
    }

    async getRawFile(filename: string): Promise<ArrayBuffer> {
        const normalizedFilename = normalizePath(filename)
        logger.debug(`Fetching '${normalizedFilename}'...`)
        const realFilename = this.listing!.get(normalizedFilename)
        if (!realFilename) {
            throw new FileNotFoundError(filename)
        }
        try {
            const content = await fs.promises.readFile(path.join(this.rootDir, realFilename))
            return content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength)
        } catch (e) {
            // throw new FileNotFoundError(normalizedFilename)
            throw e
        }
    }
}
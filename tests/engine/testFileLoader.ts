import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../../src/engine/logging'
import { normalizePath } from '../../src/filesystem'
import { SimpleFileLoader } from '../../src/filesystem/fileLoader'

export class TestFileLoader extends SimpleFileLoader {
    private listing: string[] | null = null

    constructor(private readonly rootDir: string) {
        super()
    }

    async init(): Promise<void> {
        logger.debug('Fetching files listing...')
        this.listing = (await fs.promises.readdir(this.rootDir, { recursive: true })).map(normalizePath)
    }

    getFilesListing(): string[] {
        return this.listing!
    }

    async getRawFile(filename: string): Promise<ArrayBuffer> {
        const normalizedFilename = normalizePath(filename)
        logger.debug(`Fetching '${normalizedFilename}'...`)
        try {
            const content = await fs.promises.readFile(path.join(this.rootDir, normalizedFilename))
            return content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength)
        } catch (e) {
            // throw new FileNotFoundError(normalizedFilename)
            throw e
        }
    }
}
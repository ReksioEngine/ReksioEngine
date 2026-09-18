import * as fs from 'fs'
import * as path from 'path'
import decompress from 'decompress'
import { logger } from '../../src/engine/logging'
import { normalizePath, normalizePathKeepCase } from '../../src/filesystem'
import { FileNotFoundError, SimpleFileLoader } from '../../src/filesystem/fileLoader'

const snapshotDirPath = 'output'
const zippedSnapshotDirPath = 'output.zip'
const actualDirPath = '.output'

function isError(error: any): error is NodeJS.ErrnoException {
    return 'errno' in error
        && 'code' in error
        && 'path' in error
        && 'syscall' in error
        && 'stack' in error
}

export class TestFileLoader extends SimpleFileLoader {
    protected listing: Map<string, string> | null = null

    constructor(private readonly rootDir: string) {
        super()
    }

    async init(): Promise<void> {
        try {
            await decompress(`${this.rootDir}/${zippedSnapshotDirPath}`, `${this.rootDir}/${snapshotDirPath}`)
        } catch (e) {
            if (!(isError(e) && e.code === 'ENOENT')) {
                throw e
            }
        }
        logger.debug('Fetching files listing...')
        this.listing = new Map((await fs.promises.readdir(this.rootDir, { recursive: true })).map((filename: string) => [normalizePath(filename), filename]))
    }

    getFilesListing(): string[] {
        return [...this.listing!.keys()]
    }

    getSnapshotFilesListing(): string[] {
        return this.getFilesListing().filter(e => e.startsWith(`${snapshotDirPath}/`))
            .filter(e => !e.substring(e.indexOf('/') + 1).startsWith('.'))
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

    async saveActualSnapshotFile(filename: string, content: ArrayBuffer) {
        if (!filename.startsWith(`${snapshotDirPath}/`)) {
            throw new Error('Not a snapshot file')
        }
        const existingFilename = this.listing?.get(normalizePath(filename))
        if (!existingFilename) {
            throw new Error('The file does not exist')
        }
        const actualFilename = normalizePathKeepCase(existingFilename).replace(`${snapshotDirPath}/`, `${actualDirPath}/`)
        const fullPath = path.join(this.rootDir, actualFilename)
        const dirPath = path.dirname(fullPath)
        logger.debug(`Making sure directory exists at: ${dirPath}...`)
        await fs.promises.mkdir(dirPath, { recursive: true })
        logger.debug(`Writing actual snapshot file to: ${fullPath}...`)
        await fs.promises.writeFile(fullPath, new Uint8Array(content))
    }
}
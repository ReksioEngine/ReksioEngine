import { decryptCNV, parseCNV } from '../fileFormats/cnv'
import { loadImage } from '../fileFormats/img'
import { ANN, loadAnn } from '../fileFormats/ann'
import { CNV } from '../fileFormats/cnv/parser'
import { Image } from '../fileFormats/img'
import { parseSequence, SequenceFile } from '../fileFormats/seq'
import { Iso9660Reader } from './iso9660'

export class FileNotFoundError extends Error {
    constructor(filename: string) {
        super(`File '${filename}' not found in files listing`)
    }
}

export abstract class FileLoader {
    abstract init(): Promise<void>
    abstract getRawFile(filename: string): Promise<ArrayBuffer>
    abstract getCNVFile(filename: string): Promise<CNV>
    abstract getSequenceFile(filename: string): Promise<SequenceFile>
    abstract getIMGFile(filename: string): Promise<Image>
    abstract getANNFile(filename: string): Promise<ANN>
    abstract getFilesListing(): string[]
    abstract hasFile(filename: string): boolean
}

abstract class SimpleFileLoader extends FileLoader {
    async getANNFile(filename: string): Promise<ANN> {
        const data = await this.getRawFile(filename)
        return loadAnn(data)
    }

    async getCNVFile(filename: string): Promise<CNV> {
        const data = await this.getRawFile(filename)
        const text = decryptCNV(data)
        console.debug(text)
        return parseCNV(text)
    }

    async getSequenceFile(filename: string): Promise<SequenceFile> {
        const data = await this.getRawFile(filename)
        const decoder = new TextDecoder()
        const text = decoder.decode(data)
        console.debug(text)
        return parseSequence(text)
    }

    async getIMGFile(filename: string): Promise<Image> {
        if (!filename.toLowerCase().endsWith('.img')) {
            filename = filename + '.img'
        }

        const data = await this.getRawFile(filename)
        return loadImage(data)
    }

    hasFile(filename: string): boolean {
        return this.getFilesListing().includes(filename.toLowerCase().replace(/\\/g, '/'))
    }
}

export abstract class UrlFileLoader extends SimpleFileLoader {
    protected listing: Map<string, string> | null = null

    protected abstract fetchFilesListing(): Promise<Map<string, string>>

    async init(): Promise<void> {
        console.debug('Fetching files listing...')
        this.listing = await this.fetchFilesListing()
    }

    getFilesListing(): string[] {
        return [...this.listing!.keys()]
    }

    async getRawFile(filename: string): Promise<ArrayBuffer> {
        const normalizedFilename = filename.toLowerCase().replace(/\\/g, '/')
        console.debug(`Fetching '${normalizedFilename}'...`)
        const fileUrl = this.listing!.get(normalizedFilename)
        if (fileUrl == null) {
            throw new FileNotFoundError(normalizedFilename)
        }

        const response = await fetch(fileUrl)
        return await response.arrayBuffer()
    }
}

export class GithubFileLoader extends UrlFileLoader {
    private readonly filesListUrl
    private readonly filesBaseUrl

    constructor(gameName: string) {
        super()
        this.filesListUrl = `https://api.github.com/repos/ReksioEngine/GamesFiles/git/trees/${gameName}?recursive=1/`
        this.filesBaseUrl = `https://raw.githubusercontent.com/ReksioEngine/GamesFiles/${gameName}/`
    }

    // Windows case-insensitive filenames moment
    protected async fetchFilesListing() {
        const response = await fetch(this.filesListUrl)
        const data = await response.json()
        return new Map<string, string>(
            data.tree.map((entry: any) => [entry.path.toLowerCase(), this.filesBaseUrl + entry.path])
        )
    }
}

export class ArchiveOrgFileLoader extends UrlFileLoader {
    private readonly baseUrl: string

    constructor(baseUrl: string) {
        super()
        this.baseUrl = baseUrl
    }

    // Windows case-insensitive filenames moment
    protected async fetchFilesListing() {
        const response = await fetch(this.baseUrl)
        const html = await response.text()

        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        const table = doc.querySelector('.archext')
        if (table == null) {
            throw new Error('Failed to fetch files listing table')
        }

        const links = table.querySelectorAll('a')
        return new Map<string, string>(
            [...links].map((link) => [link.textContent!.toLowerCase(), link.getAttribute('href')!])
        )
    }
}

export class IsoFileLoader extends SimpleFileLoader {
    private isoReader: Iso9660Reader

    constructor(file: File) {
        super()
        this.isoReader = new Iso9660Reader(file)
    }

    async init() {
        await this.isoReader.load()
    }

    getFilesListing(): string[] {
        return this.isoReader.getListing()
    }

    async getRawFile(filename: string): Promise<ArrayBuffer> {
        const normalizedFilename = filename.toLowerCase().replace(/\\/g, '/')
        console.debug(`Loading '${normalizedFilename}'...`)
        const fileResult = await this.isoReader.getFile(normalizedFilename)
        if (fileResult == null) {
            throw new FileNotFoundError(normalizedFilename)
        }
        return fileResult
    }
}

export class ListingJSONUrlFileLoader extends UrlFileLoader {
    constructor(private readonly listingUrl: string) {
        super()
    }

    protected async fetchFilesListing() {
        const response = await fetch(this.listingUrl)
        const data = await response.json()
        return new Map<string, string>(Object.entries(data))
    }
}

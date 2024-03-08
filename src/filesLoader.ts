import {decryptCNV, parseCNV} from './fileFormats/cnv'
import {loadImage} from './fileFormats/img'
import {ANN, loadAnn} from './fileFormats/ann'
import {CNV} from './fileFormats/cnv/parser'
import {Image} from './fileFormats/img'

export class FileNotFoundError extends Error {
    constructor(filename: string) {
        super(`File '${filename}' not found in files listing`)
    }
}

export abstract class FileLoader {
    abstract getRawFile(filename: string): Promise<ArrayBuffer>
    abstract getCNVFile(filename: string): Promise<CNV>
    abstract getIMGFile(filename: string): Promise<Image>
    abstract getANNFile(filename: string): Promise<ANN>
    abstract getFilesListing(): string[]
    abstract getHistory(): Set<string>
}

export abstract class UrlFileLoader extends FileLoader {
    private listing: Map<string, string> | null = null
    private history: Set<string> = new Set<string>()

    protected abstract fetchFilesListing(): Promise<Map<string, string>>

    getFilesListing(): string[] {
        return [...this.listing!.keys()]
    }

    getHistory(): Set<string> {
        return this.history
    }

    async getANNFile(filename: string): Promise<ANN> {
        const data = await this.getRawFile(filename)
        return loadAnn(data)
    }

    async getCNVFile(filename: string): Promise<CNV> {
        const data = await this.getRawFile(filename)
        const text = decryptCNV(data)
        console.log(text)
        return parseCNV(text)
    }

    async getIMGFile(filename: string): Promise<Image> {
        const data = await this.getRawFile(filename)
        return loadImage(data)
    }

    async getRawFile(filename: string): Promise<ArrayBuffer> {
        if (this.listing == null) {
            console.debug('Fetching files listing...')
            this.listing = await this.fetchFilesListing()
        }

        const normalizedFilename = filename.toLowerCase()
        console.debug(`Fetching '${normalizedFilename}'...`)
        const fileUrl = this.listing.get(normalizedFilename)
        if (fileUrl == null) {
            throw new FileNotFoundError(normalizedFilename)
        }

        const response = await fetch(fileUrl)
        this.history.add(normalizedFilename)
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
        return new Map<string, string>(data.tree.map((entry: any) => [
            entry.path.toLowerCase(),
            this.filesBaseUrl + entry.path
        ]))
    }
}

export class ArchiveOrgFileLoader extends UrlFileLoader {
    private baseUrl: string = 'https://archive.org/download/reksio-i-ufo/2.%20Reksio%20i%20Ufo.iso/'

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
        return new Map<string, string>([...links].map((link) => [
            link.textContent!.toLowerCase(), link.getAttribute('href')!
        ]))
    }
}

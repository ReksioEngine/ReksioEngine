import {decryptCNV, parseCNV} from './fileFormats/cnv'
import {loadImage} from './fileFormats/img'
import {loadAnn} from './fileFormats/ann'

const ISOUrl = 'https://archive.org/download/reksio-i-ufo/2.%20Reksio%20i%20Ufo.iso/'

let listing: Map<string, string> | null = null

export class FileNotFoundError extends Error {
    constructor(filename: string) {
        super(`File '${filename}' not found in files listing`)
    }
}

// Windows case-insensitive filenames moment
const getFilesListing = async () => {
    const response = await fetch(ISOUrl)
    const html = await response.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const table = doc.querySelector('.archext')
    if (table == null) {
        throw new Error('Failed to fetch files listing table')
    }

    const links = table.querySelectorAll('a')
    const listing = new Map<string, string>();
    [...links].forEach(link => {
        listing.set(link.textContent!.toLowerCase(), link.getAttribute('href')!)
    })

    return listing
}

export const getRawFile = async (filename: string) => {
    if (listing == null) {
        console.debug('Fetching files listing...')
        listing = await getFilesListing()
    }

    console.debug(`Fetching '${filename}'...`)
    const fileUrl = listing.get(filename.toLowerCase())
    if (fileUrl == null) {
        throw new FileNotFoundError(filename)
    }

    const response = await fetch(fileUrl)
    return response.arrayBuffer()
}

export const getCNVFile = async (filename: string)=> {
    const data = await getRawFile(filename)
    const text = decryptCNV(data)
    console.log(text)
    return parseCNV(text)
}

export const getIMGFile = async (filename: string) => {
    const data = await getRawFile(filename)
    return loadImage(data)
}

export const getANNFile = async (filename: string) => {
    const data = await getRawFile(filename)
    return loadAnn(data)
}

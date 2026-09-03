import { FileStorage } from "../../src"
import { logger } from "../../src/engine/logging"


export class InMemoryStorage extends FileStorage {
    private fileMap = new Map<string, ArrayBuffer>()

    constructor() {
        super()
    }

    get list(): string[] {
        return [...this.fileMap.keys()]
    }

    async init(): Promise<void> { }

    async get(filename: string): Promise<ArrayBuffer> {
        return this.fileMap.get(filename)!
    }

    async has(filename: string): Promise<boolean> {
        return this.fileMap.has(filename)
    }

    async save(filename: string, content: ArrayBuffer): Promise<void> {
        this.fileMap.set(filename, content)
    }
}
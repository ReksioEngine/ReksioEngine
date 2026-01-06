import { IDBPDatabase, openDB } from 'idb'
import { assert } from '../common/errors'

export abstract class FileStorage {
    abstract init(): Promise<void>
    abstract get(filename: string): Promise<ArrayBuffer>
    abstract has(filename: string): Promise<boolean>
    abstract save(filename: string, content: ArrayBuffer): Promise<void>
}

export class IndexedDBStorage extends FileStorage {
    private db: IDBPDatabase | null = null

    constructor(private name: string) {
        super()
    }

    async init() {
        this.db = await openDB(this.name, 1, {
            upgrade(database: IDBPDatabase) {
                database.createObjectStore('filesystem')
            },
        })
    }

    async get(filename: string) {
        assert(this.db !== null)
        return await this.db.get('filesystem', filename)
    }

    async has(filename: string): Promise<boolean> {
        assert(this.db !== null)
        return (await this.db.count('filesystem', filename)) > 0
    }

    async save(filename: string, content: ArrayBuffer) {
        assert(this.db !== null)
        await this.db.put('filesystem', content, filename)
    }
}

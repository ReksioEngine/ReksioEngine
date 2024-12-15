import { ValueType } from './types'
import INI from 'ini'

export class SaveFile {
    private content: Map<string, Map<string, any>> = new Map()
    private readonly onChange?: (value: any) => void

    constructor(initialContent: object | null, onChange?: (value: any) => void) {
        if (initialContent !== null) {
            this.content = this.fromObject(initialContent)
        }

        if (this.onChange) {
            this.onChange(this.toObject())
        }

        this.onChange = onChange
    }

    get(group: string, key: string) {
        if (!this.content.has(group) || !this.content.get(group)?.has(key)) {
            return undefined
        }
        return this.content.get(group)!.get(key)
    }

    set(group: string, key: string, value: any) {
        if (!this.content.has(group)) {
            this.content.set(group, new Map())
        }
        this.content.get(group)!.set(key, value)

        if (this.onChange) {
            this.onChange(this.toObject())
        }
    }

    loadValue(object: ValueType<any>) {
        if (!object.parent) {
            return null
        }
        return this.get(object.parent.name, object.name) ?? null
    }

    saveValue(object: ValueType<any>, value: any) {
        if (!object.parent) {
            return
        }
        this.set(object.parent.name, object.name, value)
    }

    reset() {
        this.content.clear()
        if (this.onChange) {
            this.onChange(null)
        }
    }

    public toObject() {
        return Object.fromEntries(
            Array.from(this.content.entries()).map(([key, innerMap]) => [key, Object.fromEntries(innerMap)])
        )
    }

    private fromObject(obj: any) {
        return new Map(
            Object.entries(obj).map(([key, innerObj]) => [
                key,
                new Map(Object.entries(innerObj as Record<string, any>)),
            ])
        )
    }
}

export class SaveFileManager {
    static empty(syncWithLocalStorage: boolean = false) {
        return new SaveFile(null, syncWithLocalStorage ? this.syncWithLocalStorageHandler : undefined)
    }

    static fromLocalStorage() {
        const content = localStorage.getItem('saveFile')
        return new SaveFile(content ? JSON.parse(content) : null, this.syncWithLocalStorageHandler)
    }

    static fromINI(content: string, syncWithLocalStorage: boolean = false) {
        return new SaveFile(INI.parse(content), syncWithLocalStorage ? this.syncWithLocalStorageHandler : undefined)
    }

    static toINI(saveFile: SaveFile) {
        return INI.stringify(saveFile.toObject())
    }

    static areSavesEnabled() {
        return localStorage.getItem('savesEnabled') == 'true'
    }

    private static syncWithLocalStorageHandler(object: any) {
        if (object == null) {
            localStorage.removeItem('saveFile')
        } else {
            localStorage.setItem('saveFile', JSON.stringify(object))
        }
    }
}

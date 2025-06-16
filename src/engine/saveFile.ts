import { ValueType } from './types'
import INI from 'ini'

export type GameFileUpdateCallback = (saveFile: SaveFile) => void

export class SaveFile {
    private content: Map<string, Map<string, any>> = new Map()
    public readonly onChange?: (value: any) => void

    constructor(initialContent: object | null, onChange?: GameFileUpdateCallback) {
        if (initialContent !== null) {
            this.content = this.fromObject(initialContent)
        }

        this.onChange = onChange
        if (this.onChange) {
            this.onChange(this)
        }
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
            this.onChange(this)
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
            this.onChange(this)
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

export const createSaveFileLocalStorageHandler = (key: string) => {
    return (saveFile: SaveFile): void => {
        if (saveFile == null) {
            localStorage.removeItem(key)
        } else {
            localStorage.setItem(key, JSON.stringify(saveFile.toObject()))
        }
    }
}

export class SaveFileManager {
    static empty(updateCallback?: GameFileUpdateCallback) {
        return new SaveFile(null, updateCallback)
    }

    static fromLocalStorage(key = 'saveFile') {
        const content = localStorage.getItem(key)
        return new SaveFile(content ? JSON.parse(content) : null, createSaveFileLocalStorageHandler(key))
    }

    static fromINI(content: string, updateCallback?: GameFileUpdateCallback) {
        return new SaveFile(INI.parse(content), updateCallback)
    }

    static toINI(saveFile: SaveFile) {
        return INI.stringify(saveFile.toObject())
    }
}

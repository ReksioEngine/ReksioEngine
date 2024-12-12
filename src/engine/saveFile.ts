import { ValueType } from './types'
import INI from 'ini'

export class SaveFile {
    private content: Map<string, Map<string, any>> = new Map()

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
        this.saveToLocalStorage()
    }

    load(object: ValueType<any>) {
        if (!object.parent) {
            return null
        }
        return this.get(object.parent.name, object.name) ?? null
    }

    save(object: ValueType<any>, value: any) {
        if (!object.parent) {
            return
        }

        this.set(object.parent.name, object.name, value)
    }

    reset(removeFromStorage = true) {
        this.content.clear()
        if (removeFromStorage) {
            localStorage.removeItem('saveFile')
        }
    }

    public importFromINI(content: string) {
        this.content = this.fromObject(INI.parse(content))
    }

    public exportToINI() {
        return INI.stringify(this.toObject())
    }

    public saveToLocalStorage() {
        localStorage.setItem('saveFile', JSON.stringify(this.toObject()))
    }

    public loadFromLocalStorage() {
        const storedContent = localStorage.getItem('saveFile')
        if (storedContent) {
            this.content = this.fromObject(JSON.parse(storedContent))
        }
    }

    private toObject() {
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

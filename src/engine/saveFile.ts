import { ValueType } from './types'

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
}

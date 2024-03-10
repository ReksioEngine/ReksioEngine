import {Type} from './types'

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

    load(object: Type<any>) {
        if (!object.parent) {
            return null
        }

        return this.get(object.parent.name, object.name)
    }

    save(object: Type<any>, value: any) {
        if (!object.parent) {
            return
        }

        this.set(object.parent.name, object.name, value)
    }
}

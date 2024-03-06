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
        return this.get(object.parent?.definition._NAME, object.definition._NAME)
    }

    save(object: Type<any>, value: any) {
        this.set(object.parent?.definition._NAME, object.definition._NAME, value)
    }
}

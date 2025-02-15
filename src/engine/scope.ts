import { Type } from './types'

export class ScopeManager {
    public scopes: Array<Scope> = []

    public newScope() {
        const newScope = new Scope()
        this.scopes.push(newScope)
        return newScope
    }

    public pushScope(scope: Scope) {
        this.scopes.push(scope)
    }

    public popScope() {
        return this.scopes.pop()
    }

    public getScope(level: number = 0) {
        return this.scopes[this.scopes.length - 1 - level]
    }

    public findByName(name: string) {
        return this.find((key: string, object: Type<any>) => key === name)
    }

    public findByType<TYPE>(type: string): TYPE | null {
        return this.find((key: string, object: Type<any>) => object.definition.TYPE === type)
    }

    public find<TYPE>(callback: (key: string, object: Type<any>) => boolean, level = 0): TYPE | null {
        const scope = this.getScope(level)
        if (!scope) {
            return null
        }

        const result = Object.entries(scope.entries).find(([key, value]) => callback(key, value))
        if (result) {
            return result[1]
        } else {
            return this.find(callback, level + 1)
        }
    }
}

export class Scope {
    constructor(public entries: Record<string, any> = {}) {}

    public get(name: string): Type<any> | null {
        return this.entries[name] ?? null
    }

    public set(name: string, value: Type<any>): void {
        this.entries[name] = value
    }

    public remove(name: string): void {
        delete this.entries[name]
    }

    public get objects() {
        return Object.values(this.entries)
    }
}

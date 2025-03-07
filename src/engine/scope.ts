import { Type } from './types'

export class ScopeManager {
    public scopes: Array<Scope> = []

    public newScope(type: string) {
        const newScope = new Scope(type)
        this.scopes.push(newScope)
        return newScope
    }

    public pushScope(scope: Scope) {
        this.scopes.push(scope)
    }

    public popScope() {
        return this.scopes.pop()
    }

    public getScope(level: number | string = 0) {
        if (typeof level === 'string') {
            for (let i = this.scopes.length - 1; i >= 0; i--) {
                const scope = this.scopes[i]
                if (scope.type === level) {
                    return scope
                }
            }
            return null
        } else {
            return this.scopes[this.scopes.length - 1 - level]
        }
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

        const result = [...scope.content.entries()].find(([key, value]) => callback(key, value))
        if (result) {
            return result[1]
        } else {
            return this.find(callback, level + 1)
        }
    }
}

export class Scope {
    constructor(
        public type: string,
        public content: Map<string, any> = new Map()
    ) {}

    public get(name: string): Type<any> | null {
        return this.content.get(name) ?? null
    }

    public set(name: string, value: Type<any>): void {
        this.content.set(name, value)
    }

    public remove(name: string): void {
        this.content.delete(name)
    }

    public get objects() {
        return [...this.content.values()]
    }
}

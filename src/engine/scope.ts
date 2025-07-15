import { Type } from './types'
import { Application } from './types/application'
import { assert } from '../common/errors'

const byName = (name: string) => (key: string, object: Type<any>) => key === name
const byType = (type: string) => (key: string, object: Type<any>) => object.definition.TYPE === type

export class ScopeManager {
    public scopes: Array<Scope> = []
    public localScopes: Array<Scope> = []

    public newScope(type: string) {
        const newScope = new Scope(type)
        this.scopes.push(newScope)
        return newScope
    }

    public removeScope(scope: Scope) {
        this.scopes.splice(this.scopes.indexOf(scope), 1)
    }

    public pushLocalScope(scope: Scope) {
        this.localScopes.push(scope)
    }

    public popLocalScope() {
        return this.localScopes.pop()
    }

    public findByName<T extends Type<any>>(name: string, parentScope: Scope | null = null): T | null {
        const local = this._find<T>(byName(name), this.localScopes)
        if (local) {
            return local
        }

        const startIndex = parentScope && this.scopes.includes(parentScope) ? this.scopes.length - 1 - this.scopes.indexOf(parentScope) : 0
        return this._find(byName(name), this.scopes, startIndex)
    }

    public findByType<TYPE>(type: string): TYPE | null {
        return this._find(byType(type), this.scopes)
    }

    public find<TYPE>(callback: (key: string, object: Type<any>) => boolean, scopes?: Array<Scope>): TYPE | null {
        return this._find(callback, scopes ?? this.scopes)
    }

    public _find<TYPE>(callback: (key: string, object: Type<any>) => boolean, scopes: Array<Scope>, level = 0): TYPE | null {
        const scope = scopes[scopes.length - 1 - level]
        if (!scope) {
            return null
        }

        const result = scope.find(callback)
        if (result) {
            return result
        } else {
            return this._find(callback, scopes, level + 1)
        }
    }

    public getScopeOf(object: Type<any>, level = 0): Scope | null {
        const scope = this.scopes[this.scopes.length - 1 - level]
        if (!scope) {
            return null
        }

        const result = [...scope.content.values()].includes(object)
        if (result) {
            return scope
        } else {
            return this.getScopeOf(object, level + 1)
        }
    }

    public get APPLICATION() {
        const application: Application | null = this.findByType('APPLICATION')
        assert(application != null)
        return application
    }
}

export class Scope {
    constructor(
        public type: string,
        public content: Map<string, any> = new Map()
    ) {}

    public get<T extends Type<any>>(name: string): T | null {
        return this.content.get(name) ?? null
    }

    public set(name: string, value: Type<any>): void {
        this.content.set(name, value)
    }

    public remove(name: string): void {
        this.content.delete(name)
    }

    public find(callback: (name: string, object: Type<any>) => boolean) {
        for (const [key, value] of this.content.entries()) {
            if (callback(key, value)) {
                return value
            }
        }
        return null
    }

    public get objects() {
        return [...this.content.values()]
    }
}

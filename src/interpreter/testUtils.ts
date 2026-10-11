import { Engine } from '../engine'
import { Scope, ScopeManager } from '../engine/scope'
import { ScriptingManager } from '../engine/scripting'
import { Type } from '../engine/types'
import { Integer } from '../engine/types/integer'
import { String as CMCString } from '../engine/types/string'
import { Behaviour } from '../engine/types/behaviour'
import { createCallback, reference } from '../fileFormats/common'
import { allLogs } from '../engine/logging'
import { runCode } from './interpreter'

export class TestEngine {
    public scopeManager = new ScopeManager()
    public scripting = new ScriptingManager(this.asEngine())
    public saveFile = { loadValue: () => null, saveValue: () => {} }
    public scope: Scope = this.scopeManager.newScope('scene')

    constructor() {
        allLogs.length = 0
    }

    asEngine(): Engine {
        return this as unknown as Engine
    }

    getObject<T extends Type<any>>(name: string | reference | null, parentScope: Scope | null = null): T | null {
        if (name === null) {
            return null
        }
        return this.scopeManager.findByName<T>(typeof name === 'string' ? name : name.objectName, parentScope)
    }

    add<T extends Type<any>>(object: T): T {
        this.scope.set(object.name, object)
        return object
    }

    integer(name: string, value: number = 0) {
        return this.add(new Integer(this.asEngine(), null, { TYPE: 'INTEGER', NAME: name, VALUE: value } as any))
    }

    string(name: string, value: string = '') {
        return this.add(new CMCString(this.asEngine(), null, { TYPE: 'STRING', NAME: name, VALUE: value } as any))
    }

    behaviour(name: string, code: string) {
        return this.add(
            new Behaviour(this.asEngine(), null, { TYPE: 'BEHAVIOUR', NAME: name, CODE: createCallback(code) } as any)
        )
    }

    run(script: string, args: any[] = []) {
        return runCode(this.asEngine(), null, script, args, false)
    }

    get errors() {
        return allLogs.filter((log) => log.type === 'error')
    }
}

import { Engine } from '../engine'
import { Scope, ScopeManager } from '../engine/scope'
import { ScriptingManager } from '../engine/scripting'
import { SaveFileManager } from '../engine/saveFile'
import { Type } from '../engine/types'
import { Application } from '../engine/types/application'
import { Scene } from '../engine/types/scene'
import { Integer } from '../engine/types/integer'
import { Double } from '../engine/types/double'
import { Bool } from '../engine/types/bool'
import { String as CMCString } from '../engine/types/string'
import { Behaviour } from '../engine/types/behaviour'
import { createCallback, reference } from '../fileFormats/common'
import { CNVObject, parseCNV } from '../fileFormats/cnv/parser'
import { allLogs } from '../engine/logging'
import { runCode } from '../interpreter'
import Filesystem, { normalizePath } from '../filesystem'
import { FileLoader, FileNotFoundError } from '../filesystem/fileLoader'
import { FileStorage } from '../filesystem/fileStorage'
import { createObject, doReady, loadDefinition } from '../filesystem/definitionLoader'

export class MemoryFileLoader extends FileLoader {
    public files = new Map<string, ArrayBuffer>()

    async init() {}

    async getRawFile(filename: string) {
        const file = this.files.get(normalizePath(filename))
        if (file === undefined) {
            throw new FileNotFoundError(normalizePath(filename))
        }
        return file
    }

    getFilesListing() {
        return [...this.files.keys()]
    }

    hasFile(filename: string) {
        return this.files.has(normalizePath(filename))
    }
}

export class MemoryFileStorage extends FileStorage {
    public files = new Map<string, ArrayBuffer>()

    async init() {}

    async get(filename: string) {
        return this.files.get(filename) as ArrayBuffer
    }

    async has(filename: string) {
        return this.files.has(filename)
    }

    async save(filename: string, content: ArrayBuffer) {
        this.files.set(filename, content)
    }
}

export class TestEngine {
    public speed = 1
    public music = null
    public options = {}
    public app = { ticker: { start: () => {}, stop: () => {} } }

    public scopeManager = new ScopeManager()
    public scripting = new ScriptingManager(this.asEngine())
    public saveFile = SaveFileManager.empty()

    public fileLoader = new MemoryFileLoader()
    public storage = new MemoryFileStorage()
    public filesystem = new Filesystem(this.fileLoader, this.storage)

    public rootScope: Scope = this.scopeManager.newScope('root')
    public scope: Scope = this.scopeManager.newScope('scene')

    public application = new Application(this.asEngine(), null, { TYPE: 'APPLICATION', NAME: 'APPLICATION' } as any)
    public currentScene: Scene = new Scene(this.asEngine(), null, {
        TYPE: 'SCENE',
        NAME: 'SCENE',
        PATH: 'SCENE',
    } as any)
    public previousScene: Scene | null = null

    constructor() {
        allLogs.length = 0

        this.rootScope.set(this.application.name, this.application)
        this.rootScope.set(this.currentScene.name, this.currentScene)
        this.currentScene.scope = this.scope
    }

    asEngine(): Engine {
        return this as unknown as Engine
    }

    getObject<T extends Type<any>>(name: string | reference | null, parentScope: Scope | null = null): T | null {
        return Engine.prototype.getObject.call(this, name, parentScope) as T | null
    }

    resolvePath(path: string, base = ''): Promise<string> {
        return Engine.prototype.resolvePath.call(this, path, base)
    }

    add<T extends Type<any>>(object: T): T {
        this.scope.set(object.name, object)
        return object
    }

    async create<T extends Type<any>>(definition: CNVObject): Promise<T> {
        return (await createObject(this.asEngine(), definition, this.currentScene)) as unknown as T
    }

    async load(cnv: string) {
        await loadDefinition(this.asEngine(), this.scope, parseCNV(cnv), this.currentScene)
        await doReady(this.scope)
    }

    integer(name: string, value: number = 0) {
        return this.add(
            new Integer(this.asEngine(), this.currentScene, { TYPE: 'INTEGER', NAME: name, VALUE: value } as any)
        )
    }

    double(name: string, value: number = 0.0) {
        return this.add(
            new Double(this.asEngine(), this.currentScene, { TYPE: 'DOUBLE', NAME: name, VALUE: value } as any)
        )
    }

    boolean(name: string, value: boolean = false) {
        return this.add(new Bool(this.asEngine(), this.currentScene, { TYPE: 'BOOL', NAME: name, VALUE: value } as any))
    }

    string(name: string, value: string = '') {
        return this.add(
            new CMCString(this.asEngine(), this.currentScene, { TYPE: 'STRING', NAME: name, VALUE: value } as any)
        )
    }

    behaviour(name: string, code: string) {
        return this.add(
            new Behaviour(this.asEngine(), this.currentScene, {
                TYPE: 'BEHAVIOUR',
                NAME: name,
                CODE: createCallback(code),
            } as any)
        )
    }

    addFile(path: string, content: string | ArrayBuffer) {
        const data = typeof content === 'string' ? new TextEncoder().encode(content).buffer : content
        this.fileLoader.files.set(normalizePath(path), data as ArrayBuffer)
    }

    run(script: string, args: any[] = []) {
        return runCode(this.asEngine(), null, script, args, false)
    }

    get errors() {
        return allLogs.filter((log) => log.type === 'error')
    }
}

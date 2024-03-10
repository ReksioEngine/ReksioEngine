import {Engine} from '../index'
import {TypeDefinition} from '../../fileFormats/common'
import {NotImplementedError} from '../../utils'
import {CallbacksComponent} from '../components/callbacks'

export class Type<DefinitionType extends TypeDefinition> {
    protected callbacks: CallbacksComponent

    protected engine: Engine
    public readonly definition: DefinitionType

    public isReady: boolean = false
    public parent?: Type<any>
    protected _value: any = undefined
    public name: string = ''

    public clones: Array<Type<DefinitionType>> = []

    constructor(engine: Engine, definition: DefinitionType) {
        this.engine = engine
        this.definition = definition
        this.name = definition.NAME
        this.callbacks = new CallbacksComponent(engine, this)
    }

    get value() {
        return this._value
    }

    set value(newValue: any) {
        this._value = newValue
    }

    GETNAME() {
        return this.name
    }

    async CLONE(count: number) {
        for (let i = 0; i < count; i++) {
            this.engine.cloneObject(this)
        }
    }

    GETCLONEINDEX() {
        return this.engine.getObject(this.definition.NAME).clones.indexOf(this) + 1
    }

    init() {}
    ready() {}
    destroy() {}
    tick(delta: number) {}

    // Called when trying to call a method that is not existing for a type
    __unknown_method(methodName: string, args: any[]) {
        throw new Error(`Method '${methodName}' does not exist`)
    }

    loadFromINI() {
        if (this.definition.TOINI) {
            const loadedValue = this.engine.saveFile.load(this)
            if (loadedValue !== null) {
                this.value = loadedValue
            }
        }
    }

    saveToINI() {
        if (this.definition.TOINI) {
            this.engine.saveFile.save(this, this.value)
        }
    }

    clone(): Type<DefinitionType> {
        throw new NotImplementedError()
    }
}

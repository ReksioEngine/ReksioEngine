import {Engine} from '../index'
import {TypeDefinition} from '../../fileFormats/common'

export class Type<DefinitionType extends TypeDefinition> {
    protected engine: Engine
    public readonly definition: DefinitionType

    public isReady: boolean = false
    public parent?: Type<any>
    protected _value: any = undefined

    constructor(engine: Engine, definition: DefinitionType) {
        this.engine = engine
        this.definition = definition
    }

    get value() {
        return this._value
    }

    set value(newValue: any) {
        this._value = newValue
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
            if (loadedValue !== undefined) {
                this.value = loadedValue
            }
        }
    }

    saveToINI() {
        if (this.definition.TOINI) {
            this.engine.saveFile.save(this, this.value)
        }
    }
}

import {Engine} from '../index'
import {TypeDefinition} from '../../fileFormats/common'
import {NotImplementedError} from '../../utils'
import {CallbacksComponent} from '../components/callbacks'
import {Point, Sprite} from 'pixi.js'

export class Type<DefinitionType extends TypeDefinition> {
    protected callbacks: CallbacksComponent

    protected engine: Engine
    public readonly definition: DefinitionType

    public name: string = ''
    public parent?: Type<any>
    public clones: Array<Type<DefinitionType>> = []

    constructor(engine: Engine, definition: DefinitionType) {
        this.engine = engine
        this.definition = definition
        this.name = definition.NAME
        this.callbacks = new CallbacksComponent(engine, this)
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
    __call(methodName: string, args: any[]) {
        throw new Error(`Method '${methodName}' does not exist`)
    }

    getRenderObject(): Sprite | null {
        return null
    }

    getGlobalPosition(): Point | null {
        const renderObject = this.getRenderObject()
        if (renderObject === null) {
            return null
        }
        return renderObject.toGlobal(new Point(0, 0), undefined, true) as Point ?? null
    }

    clone(): Type<DefinitionType> {
        throw new NotImplementedError()
    }
}

export class ValueType<DefinitionType extends TypeDefinition> extends Type<DefinitionType> {
    protected _value?: any

    constructor(engine: Engine, definition: DefinitionType, defaultValue: number | string | boolean | any[]) {
        super(engine, definition)
        this._value = defaultValue
        this.loadFromINI()
    }

    get value() {
        return this._value
    }

    set value(newValue: any) {
        this._value = newValue
        this.saveToINI()
    }

    protected loadFromINI() {
        if (this.definition.TOINI) {
            const loadedValue = this.engine.saveFile.load(this)
            if (loadedValue !== null) {
                this._value = this.deserialize(loadedValue)
            }
        }
    }

    protected saveToINI() {
        if (this.definition.TOINI) {
            this.engine.saveFile.save(this, this.serialize())
        }
    }

    serialize(): string {
        return this.value.toString()
    }

    deserialize(value: string): any {
        return value
    }
}

import {Engine} from '../index'
import {DisplayTypeDefinition, TypeDefinition, ValueTypeDefinition} from '../../fileFormats/common'
import {NotImplementedError} from '../../utils'
import {CallbacksComponent} from '../components/callbacks'
import {Point, Sprite} from 'pixi.js'
import {assert} from '../../errors'

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

    clone(): Type<DefinitionType> {
        // @ts-ignore
        const instance = new this.constructor(this.engine, this.definition)
        instance.parent = this.parent
        return instance
    }

    debuggerValues(): object {
        const callbacksMap = Object.entries(Object.fromEntries(this.callbacks.registry.entries()))

        return {
            name: this.name,
            type: this.constructor.name,
            definition: this.definition,
            clones: this.clones.map(clone => clone.debuggerValues()),
            callbacks: Object.fromEntries(callbacksMap.map(([key, value]) => {
                return [key, {
                    nonParametrized: value.nonParametrized,
                    parametrized: Object.fromEntries(value.parametrized.entries())
                }]
            }))
        }
    }
}

export class DisplayType<DefinitionType extends DisplayTypeDefinition> extends Type<DefinitionType> {
    private priority: number = 0

    constructor(engine: Engine, definition: DefinitionType) {
        super(engine, definition)
        this.priority = definition.PRIORITY ?? 0
    }

    GETPRIORITY() {
        return this.priority
    }

    SETPRIORITY(priority: number) {
        assert(this.getRenderObject() !== null)
        this.priority = priority

        this.getRenderObject()!.zIndex = priority
        this.engine.sortObjects()
    }

    getRenderObject(): Sprite | null {
        throw new NotImplementedError()
    }

    getGlobalPosition(): Point | null {
        const renderObject = this.getRenderObject()
        if (renderObject === null) {
            return null
        }
        return renderObject.toGlobal(new Point(0, 0), undefined, true) as Point ?? null
    }
}

export class ValueType<DefinitionType extends ValueTypeDefinition> extends Type<DefinitionType> {
    protected _value?: any

    constructor(engine: Engine, definition: DefinitionType, defaultValue?: number | string | boolean | any[]) {
        super(engine, definition)
        if (defaultValue !== undefined) {
            this.value = this.getFromINI() ?? this.definition.VALUE ?? defaultValue
        }
    }

    get value() {
        return this._value
    }

    set value(newValue: any) {
        const oldValue = this._value
        this._value = newValue
        this.valueChanged(oldValue, newValue)
        this.saveToINI()
    }

    valueChanged(oldValue: any, newValue: any) {}

    protected getFromINI() {
        if (this.definition.TOINI) {
            const loadedValue = this.engine.saveFile.load(this)
            if (loadedValue !== null) {
                return this.deserialize(loadedValue)
            }
        }
        return null
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

    debuggerValues() {
        return {
            ...super.debuggerValues(),
            value: this.value,
        }
    }
}

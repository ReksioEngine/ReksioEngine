import {Engine} from '../index'
import {DisplayTypeDefinition, TypeDefinition, ValueTypeDefinition} from '../../fileFormats/common'
import {CallbacksComponent} from '../components/callbacks'
import {Point, Sprite} from 'pixi.js'
import {assert, NotImplementedError} from '../../errors'
import {EventsComponent} from '../components/events'
import {method} from '../../types'

export class Type<DefinitionType extends TypeDefinition> {
    protected callbacks: CallbacksComponent
    public events: EventsComponent = new EventsComponent()
    public static Events = {}

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

    @method()
    GETNAME() {
        return this.name
    }

    @method()
    async CLONE(count: number) {
        for (let i = 0; i < count; i++) {
            this.cloneObject(this)
        }
    }

    @method()
    GETCLONEINDEX() {
        return this.engine.getObject(this.definition.NAME).clones.indexOf(this) + 1
    }

    private cloneObject(object: Type<any>) {
        const clone = object.clone()
        object.clones.push(clone)

        clone.name = `${object.definition.NAME}_${object.clones.length}`
        this.engine.scope[clone.name] = clone
        return clone
    }

    init() {}
    ready() {}
    destroy() {}
    tick(elapsedMS: number) {}

    // Called when trying to call a method that is not existing for a type
    __call(methodName: string, args: any[]) {
        const argumentsString = args ? args.map((arg) => typeof arg).join(', ') : ''
        throw new Error(`Method '${methodName}(${argumentsString})' does not exist`)
    }

    clone(): Type<DefinitionType> {
        // @ts-expect-error Dynamically constructing object
        const instance = new this.constructor(this.engine, this.definition)
        instance.parent = this.parent
        return instance
    }
}

export class DisplayType<DefinitionType extends DisplayTypeDefinition> extends Type<DefinitionType> {
    private priority: number = 0

    @method()
    GETPRIORITY() {
        return this.priority
    }

    @method()
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
    private readonly defaultValue?: number | string | boolean | any[]

    constructor(engine: Engine, definition: DefinitionType, defaultValue?: number | string | boolean | any[]) {
        super(engine, definition)
        this.defaultValue = defaultValue

        if (defaultValue !== undefined) {
            let initialValue = null
            if (this.definition.TOINI) {
                initialValue = this.getFromINI()
            }
            this.value = initialValue ?? this.definition.VALUE ?? defaultValue
        }
    }

    @method()
    RESETINI() {
        if (this.definition.TOINI) {
            this.value = this.definition.DEFAULT ?? this.definition.VALUE ?? this.defaultValue
            this.saveToINI()
        }
    }

    valueOf() {
        return this._value
    }

    get value() {
        return this._value
    }

    set value(newValue: any) {
        assert(typeof newValue != 'number' || !isNaN(newValue), 'Attempted to assign NaN')
        assert(newValue !== undefined, 'Attempted to assign undefined')
        assert(!Array.isArray(newValue) || !newValue.some(e => Number.isNaN(e)), 'Attempted to assign array with NaN values')
        assert(!Array.isArray(newValue) || !newValue.some(e => e === undefined), 'Attempted to assign array with undefined values')

        const oldValue = this._value
        this._value = newValue
        this.valueChanged(oldValue, newValue)

        if (this.definition.TOINI) {
            this.saveToINI()
        }
    }

    protected valueChanged(oldValue: any, newValue: any) {}

    protected getFromINI() {
        const loadedValue = this.engine.saveFile.load(this)
        if (loadedValue !== null) {
            return this.deserialize(loadedValue)
        }
        return null
    }

    protected saveToINI() {
        this.engine.saveFile.save(this, this.serialize())
    }

    protected serialize(): string {
        return this.value.toString()
    }

    protected deserialize(value: string): any {
        return value
    }
}

import { Engine } from '../index'
import { DisplayTypeDefinition, TypeDefinition, ValueTypeDefinition } from '../../fileFormats/common'
import { CallbacksComponent } from '../components/callbacks'
import { Rectangle, Sprite } from 'pixi.js'
import { assert, NotImplementedError } from '../../common/errors'
import { EventsComponent } from '../components/events'
import { method } from '../../common/types'

export type XRayInfo = {
    type: string
    bounds: Rectangle
    color?: number
    position: 'inside' | 'outside'
    visible: boolean
}

export class Type<DefinitionType extends TypeDefinition> {
    protected callbacks: CallbacksComponent
    public events: EventsComponent = new EventsComponent()
    public static Events = {}

    protected engine: Engine
    public readonly definition: DefinitionType

    public name: string = ''
    public parent: Type<any> | null
    public clones: Array<Type<DefinitionType>> = []

    public isReady: boolean = false

    constructor(engine: Engine, parent: Type<any> | null, definition: DefinitionType) {
        this.engine = engine
        this.definition = definition
        this.name = definition.NAME
        this.parent = parent

        this.callbacks = new CallbacksComponent(engine, this)
        this.callbacks.autoRegister()
    }

    @method()
    GETNAME() {
        return this.name
    }

    @method()
    CLONE(count: number) {
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
        clone.isReady = object.isReady

        this.engine.scopeManager.getScope('scene')?.set(clone.name, clone)
        return clone
    }

    init() {}
    applyDefaults() {}
    ready() {}
    destroy() {}
    tick(elapsedMS: number) {}
    pause() {}
    resume() {}

    __getXRayInfo(): XRayInfo | null {
        return null
    }

    // Called when trying to call a method that is not existing for a type
    __call(methodName: string, args: any[]) {
        const argumentsString = args ? args.map((arg) => typeof arg).join(', ') : ''
        console.error(
            `Method '${this.definition.TYPE}^${methodName}(${argumentsString})' does not exist. It might be a script fault.\nArguments: %O\nObject: %O`,
            args,
            this
        )
    }

    clone(): Type<DefinitionType> {
        // @ts-expect-error Dynamically constructing object
        return new this.constructor(this.engine, this.parent, this.definition)
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
        this.engine.rendering.sortObjects()
    }

    getRenderObject(): Sprite | null {
        throw new NotImplementedError()
    }

    __getXRayInfo(): XRayInfo | null {
        const renderObject = this.getRenderObject()
        if (renderObject === null) {
            return null
        }

        return {
            type: 'sprite',
            bounds: renderObject.getBounds(),
            position: 'outside',
            visible: renderObject.visible,
        }
    }
}

export class ValueType<DefinitionType extends ValueTypeDefinition> extends Type<DefinitionType> {
    protected _value?: any
    private readonly defaultValue?: number | string | boolean | any[]
    private readonly autoSave: boolean

    constructor(
        engine: Engine,
        parent: Type<any> | null,
        definition: DefinitionType,
        defaultValue?: number | string | boolean | any[],
        autoSave: boolean = true
    ) {
        super(engine, parent, definition)
        this.defaultValue = defaultValue
        this._value = this.getFromINI() ?? this.definition.VALUE ?? defaultValue
        this.autoSave = autoSave
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
        assert(
            !Array.isArray(newValue) || !newValue.some((e) => Number.isNaN(e)),
            'Attempted to assign array with NaN values'
        )
        assert(
            !Array.isArray(newValue) || !newValue.some((e) => e === undefined),
            'Attempted to assign array with undefined values'
        )

        const oldValue = this._value
        this._value = newValue
        this.valueChanged(oldValue, newValue)

        if (this.autoSave && this.definition.TOINI) {
            this.saveToINI()
        }
    }

    protected valueChanged(oldValue: any, newValue: any) {}

    protected getFromINI() {
        const loadedValue = this.engine.saveFile.loadValue(this)
        if (loadedValue !== null) {
            return this.deserialize(loadedValue)
        }
        return null
    }

    protected saveToINI() {
        this.engine.saveFile.saveValue(this, this.serialize())
    }

    protected serialize(): string {
        return this.value.toString()
    }

    protected deserialize(value: string): any {
        return value
    }
}

import { Engine } from '../index'
import { DisplayTypeDefinition, TypeDefinition, ValueTypeDefinition } from '../../fileFormats/common'
import { CallbacksComponent } from '../components/callbacks'
import { Rectangle, Sprite } from 'pixi.js'
import { assert, NotImplementedError } from '../../common/errors'
import { EventsComponent } from '../components/events'
import { method } from '../../common/types'
import { AdvancedSprite } from '../rendering'

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
    async CLONE(count: number) {
        for (let i = 0; i < count; i++) {
            await this.cloneObject(this)
        }
    }

    @method()
    GETCLONEINDEX() {
        const object = this.engine.getObject(this.definition.NAME)
        assert(object !== null)
        return object.clones.indexOf(this) + 1
    }

    private async cloneObject(object: Type<any>) {
        const clone = await object.clone()
        object.clones.push(clone)

        clone.name = `${object.definition.NAME}_${object.clones.length}`
        clone.isReady = true

        this.parentScope?.set(clone.name, clone)
        return clone
    }

    init() {}
    async applyDefaults() {}
    async ready() {}
    destroy() {}
    tick(elapsedMS: number) {}
    pause() {}
    resume() {}

    __getXRayInfo(): XRayInfo | null {
        return null
    }

    get parentScope() {
        return this.engine.scopeManager.getScopeOf(this)
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

    async clone(): Promise<Type<DefinitionType>> {
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
        const renderObject = this.getRenderObject()
        assert(renderObject !== null)
        this.priority = priority

        renderObject.zIndex = priority
        this.engine.rendering.putAtZindex(renderObject, priority)
        this.engine.rendering.sortObjects()
    }

    getRenderObject(): AdvancedSprite | null {
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

export class ValueType<DefinitionType extends ValueTypeDefinition, TypeOfValue> extends Type<DefinitionType> {
    protected value: TypeOfValue
    private readonly defaultValue: number | string | boolean | any[]
    private readonly autoSave: boolean

    constructor(
        engine: Engine,
        parent: Type<any> | null,
        definition: DefinitionType,
        defaultValue: number | string | boolean | any[],
        autoSave: boolean = true
    ) {
        super(engine, parent, definition)
        this.defaultValue = defaultValue
        this.value = this.getFromINI() ?? this.definition.VALUE ?? defaultValue
        this.autoSave = autoSave
    }

    @method()
    async RESETINI() {
        if (this.definition.TOINI) {
            await this.setValue(this.definition.DEFAULT ?? this.definition.VALUE ?? this.defaultValue)
            this.saveToINI()
        }
    }

    valueOf() {
        return this.value
    }

    getValue(): TypeOfValue | Promise<TypeOfValue> {
        return this.value
    }

    async setValue(newValue: TypeOfValue) {
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

        const oldValue = this.value
        this.value = newValue
        await this.valueChanged(oldValue, newValue)

        if (this.autoSave && this.definition.TOINI) {
            this.saveToINI()
        }
        return newValue
    }

    protected async valueChanged(oldValue: any, newValue: any) {}

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
        assert(this.value !== null && this.value !== undefined)
        return this.value.toString()
    }

    protected deserialize(value: string): any {
        return value
    }
}

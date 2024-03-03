import {Engine} from '../index'

export class Type<DefinitionType> {
    protected engine: Engine
    public readonly definition: DefinitionType

    public isReady: boolean = false

    constructor(engine: Engine, definition: DefinitionType) {
        this.engine = engine
        this.definition = definition
    }

    init() {}
    ready() {}
    destroy() {}
    tick(delta: number) {}

    // Called when trying to call a method that is not existing for a type
    __unknown_method(methodName: string, args: any[]) {
        throw new Error(`Method '${methodName}' does not exist`)
    }
}

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
}

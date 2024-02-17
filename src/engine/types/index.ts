import {Engine} from '../index'

export class Type<DefinitionType> {
    protected engine: Engine
    protected readonly definition: DefinitionType

    constructor(engine: Engine, definition: DefinitionType) {
        this.engine = engine
        this.definition = definition
    }

    init() {}
}


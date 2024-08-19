import {Type} from './index'
import {StaticFilterDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../errors'

export class StaticFilter extends Type<StaticFilterDefinition> {
    private properties = new Map<string, any>()

    constructor(engine: Engine, definition: StaticFilterDefinition) {
        super(engine, definition)
    }

    SETPROPERTY(name: string, value: any) {
        this.properties.set(name, value)
    }

    LINK(arg: any) {
        throw new NotImplementedError()
    }

    UNLINK(arg: any) {
        throw new NotImplementedError()
    }
}

import {ValueType} from './index'
import {MultiArrayDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../errors'

export class MultiArray extends ValueType<MultiArrayDefinition> {
    constructor(engine: Engine, definition: MultiArrayDefinition) {
        super(engine, definition, [])
    }

    SET(arg1: number, arg2: number, arg3: any) {
        throw new NotImplementedError()
    }

    GET(arg1: number, arg2: number) {
        throw new NotImplementedError()
    }
}

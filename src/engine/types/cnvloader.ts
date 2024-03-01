import {Type} from './index'
import {CNVLoaderDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'

export class CNVLoader extends Type<CNVLoaderDefinition> {
    constructor(engine: Engine, definition: CNVLoaderDefinition) {
        super(engine, definition)
    }

    LOAD(filename: string) {
        throw new NotImplementedError()
    }
}

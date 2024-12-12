import { Type } from './index'
import { CNVLoaderDefinition } from '../../fileFormats/cnv/types'
import { NotImplementedError } from '../../errors'
import { method } from '../../types'

export class CNVLoader extends Type<CNVLoaderDefinition> {
    @method()
    LOAD(filename: string) {
        throw new NotImplementedError()
    }
}

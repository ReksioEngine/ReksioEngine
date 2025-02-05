import { Type } from './index'
import { CNVLoaderDefinition } from '../../fileFormats/cnv/types'
import { NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'

export class CNVLoader extends Type<CNVLoaderDefinition> {
    @method()
    LOAD(filename: string) {
        throw new NotImplementedError()
    }
}

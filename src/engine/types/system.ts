import { Type } from './index'
import { SystemDefinition } from '../../fileFormats/cnv/types'
import { method, int } from '../../common/types'

export class System extends Type<SystemDefinition> {
    @method()
    GETDATE(): int {
        const date = new Date()
        return date.getDate() - 0xf41db + (date.getMonth() + (date.getFullYear() - 1900) * 100) * 100
    }
}

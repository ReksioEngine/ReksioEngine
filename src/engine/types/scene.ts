import {Type} from './index'
import {SceneDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {pathJoin} from '../../utils'

export class Scene extends Type<SceneDefinition> {
    constructor(engine: Engine, definition: SceneDefinition) {
        super(engine, definition)
    }

    getRelativePath(filename: string) {
        return pathJoin('DANE', this.definition.PATH, filename)
    }
}

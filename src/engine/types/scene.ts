import {Type} from './index'
import {SceneDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'

export class Scene extends Type<SceneDefinition> {
    constructor(engine: Engine, definition: SceneDefinition) {
        super(engine, definition)
    }
}

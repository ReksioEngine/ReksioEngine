import {Type} from './index'
import {Engine} from '../index'
import {SequenceDefinition} from '../../fileFormats/cnv/types'
import {FileNotFoundError} from '../../filesLoader'
import {SequenceFile} from '../../fileFormats/seq'
import {NotImplementedError} from '../../utils'

export class Sequence extends Type<SequenceDefinition> {
    private sequenceFile?: SequenceFile

    constructor(engine: Engine, definition: SequenceDefinition) {
        super(engine, definition)
    }

    async init() {
        const relativePath = this.engine.currentScene?.getRelativePath(this.definition.FILENAME)
        if (relativePath == undefined) {
            throw new FileNotFoundError('Could not get scene directory path')
        }

        this.sequenceFile = await this.engine.fileLoader.getSequenceFile(relativePath)
    }

    PLAY() {
        throw new NotImplementedError()
    }

    HIDE() {
        throw new NotImplementedError()
    }

    STOP() {
        throw new NotImplementedError()
    }
}

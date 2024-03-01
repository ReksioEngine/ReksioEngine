import {Type} from './index'
import {MusicDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {loadSound} from '../assetsLoader'
import {Sound} from '@pixi/sound'

export class Music extends Type<MusicDefinition> {
    private sound: Sound | null = null

    constructor(engine: Engine, definition: MusicDefinition) {
        super(engine, definition)
    }

    async init() {
        this.sound = await loadSound(this.definition.FILENAME, {
            loop: true
        })
    }

    destroy() {
        this.sound?.stop()
    }

    ready() {
        this.sound?.play()
    }
}

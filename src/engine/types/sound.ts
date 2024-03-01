import {Type} from './index'
import {Engine} from '../index'
import {loadSound} from '../assetsLoader'
import {SoundDefinition} from '../../fileFormats/cnv/types'
import {Sound as PIXISound} from '@pixi/sound'

export class Sound extends Type<SoundDefinition> {
    private sound: PIXISound | null = null

    constructor(engine: Engine, definition: SoundDefinition) {
        super(engine, definition)
    }

    async init() {
        // We don't respect 'PRELOAD' false on purpose, because network download might be slow
        this.sound = await loadSound(`Wavs/${this.definition.FILENAME}`)

        if (this.definition.ONINIT) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }
    }

    // This argument is "PLAY" for kurator in intro for some reason
    PLAY(arg: any) {
        this.sound?.play()
    }

    STOP(arg: boolean) {
        this.sound?.stop()
    }

    RESUME() {
        this.sound?.resume()
    }

    PAUSE() {
        this.sound?.pause()
    }

    async LOAD(filename: string) {
        this.sound = await loadSound(filename.substring(1))
    }
}

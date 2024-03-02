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

    destroy() {
        this.sound?.stop()
        this.sound?.destroy()
    }

    // This argument is "PLAY" for kurator in intro for some reason
    async PLAY(arg: any) {
        console.debug(`Playing sound '${this.definition.FILENAME}'`)
        const instance = await this.sound!.play()
        instance.on('end', this.onComplete.bind(this))
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

    onComplete() {
        console.debug(`Finished playing sound '${this.definition.FILENAME}'`)
        if (this.definition.ONFINISHED) {
            this.engine.executeCallback(this, this.definition.ONFINISHED)
        }
    }
}

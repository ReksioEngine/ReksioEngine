import {Type} from './index'
import {Engine} from '../index'
import {loadSound} from '../assetsLoader'
import {SoundDefinition} from '../../fileFormats/cnv/types'
import {Sound as PIXISound} from '@pixi/sound'
import {FileNotFoundError} from '../../filesLoader'

export class Sound extends Type<SoundDefinition> {
    private sound: PIXISound | null = null

    constructor(engine: Engine, definition: SoundDefinition) {
        super(engine, definition)
    }

    async init() {
        // We don't respect 'PRELOAD' false on purpose, because network download might be slow
        await this.loadSound(`Wavs/${this.definition.FILENAME}`)

        if (this.definition.ONINIT) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }
    }

    destroy() {
        if (this.sound === null) return
        this.sound.stop()
    }

    // This argument is "PLAY" for kurator in intro for some reason
    async PLAY(arg: any) {
        if (this.sound === null) return
        console.debug(`Playing sound '${this.definition.FILENAME}'`)
        const instance = await this.sound.play()
        instance.on('end', this.onComplete.bind(this))
    }

    STOP(arg: boolean) {
        if (this.sound === null) return
        this.sound.stop()
    }

    RESUME() {
        if (this.sound === null) return
        this.sound.resume()
    }

    PAUSE() {
        if (this.sound === null) return
        this.sound.pause()
    }

    async LOAD(filename: string) {
        await this.loadSound(filename.substring(1))
    }

    async loadSound(path: string) {
        try {
            this.sound = await loadSound(path)
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                // Ignore sound loading errors
                // because there are some sounds for other language versions
                // that it tries to load, but they are not there
                console.warn(err)
            } else {
                throw err
            }
        }
    }

    onComplete() {
        console.debug(`Finished playing sound '${this.definition.FILENAME}'`)
        if (this.definition.ONFINISHED) {
            this.engine.executeCallback(this, this.definition.ONFINISHED)
        }
    }
}

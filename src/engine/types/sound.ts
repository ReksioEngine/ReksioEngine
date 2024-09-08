import {Type} from './index'
import {Engine} from '../index'
import {loadSound} from '../assetsLoader'
import {SoundDefinition} from '../../fileFormats/cnv/types'
import {Sound as PIXISound} from '@pixi/sound'
import {FileNotFoundError} from '../filesLoader'
import {assert} from '../../errors'

export class Sound extends Type<SoundDefinition> {
    private sound: PIXISound | null = null

    constructor(engine: Engine, definition: SoundDefinition) {
        super(engine, definition)
        this.callbacks.register('ONINIT', definition.ONINIT)
        this.callbacks.register('ONSTARTED', definition.ONSTARTED)
        this.callbacks.register('ONFINISHED', definition.ONFINISHED)
    }

    async init() {
        // We don't respect 'PRELOAD' false on purpose, because network download might be slow
        await this.loadSound(`Wavs/${this.definition.FILENAME}`)
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    destroy() {
        // assert(this.sound !== null) // Why does it even happen?
        if (this.sound !== null) {
            this.sound.stop()
        }
    }

    // This argument is "PLAY" for kurator in intro for some reason
    async PLAY(arg: any) {
        assert(this.sound !== null)

        const instance = await this.sound.play({
            speed: this.engine.speed
        })
        instance.on('start', this.onStart.bind(this))
        instance.on('end', this.onEnd.bind(this))
    }

    STOP(arg: boolean) {
        assert(this.sound !== null)
        this.sound.stop()
    }

    RESUME() {
        assert(this.sound !== null)
        this.sound.resume()
    }

    PAUSE() {
        assert(this.sound !== null)
        this.sound.pause()
    }

    async LOAD(filename: string) {
        await this.loadSound(filename.substring(1))
    }

    private async loadSound(path: string) {
        try {
            this.sound = await loadSound(this.engine.fileLoader, path)
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

    onStart() {
        console.debug(`Playing sound '${this.definition.FILENAME}'`)
        this.callbacks.run('ONSTARTED')
    }

    onEnd() {
        console.debug(`Finished playing sound '${this.definition.FILENAME}'`)
        this.callbacks.run('ONFINISHED')
    }
}

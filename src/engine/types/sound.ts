import { Type } from './index'
import { loadSound } from '../../loaders/assetsLoader'
import { SoundDefinition } from '../../fileFormats/cnv/types'
import { Sound as PIXISound } from '@pixi/sound'
import { FileNotFoundError } from '../../loaders/filesLoader'
import { assert, NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'

export class Sound extends Type<SoundDefinition> {
    private sound: PIXISound | null = null

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
    @method()
    async PLAY(arg?: any) {
        assert(this.sound !== null)

        const instance = await this.sound.play()
        this.onStart()
        instance.on('end', this.onEnd.bind(this))
    }

    @method()
    STOP(arg?: boolean) {
        assert(this.sound !== null)
        this.sound.stop()
    }

    @method()
    RESUME() {
        assert(this.sound !== null)
        this.sound.resume()
    }

    @method()
    PAUSE() {
        assert(this.sound !== null)
        this.sound.pause()
    }

    @method()
    RELEASE() {
        this.sound?.stop()
        this.sound?.destroy()
    }

    @method()
    SETFREQ(frequency: number) {
        throw new NotImplementedError()
    }

    @method()
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

    private onStart() {
        console.debug(`Playing sound '${this.definition.FILENAME}'`)
        this.callbacks.run('ONSTARTED')
    }

    private onEnd() {
        console.debug(`Finished playing sound '${this.definition.FILENAME}'`)
        this.callbacks.run('ONFINISHED')
    }
}

import { Type } from './index'
import { loadSound } from '../../filesystem/assetsLoader'
import { SoundDefinition } from '../../fileFormats/cnv/types'
import { FileNotFoundError } from '../../filesystem/fileLoader'
import { assert, NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'
import { ISound, SimulatedSound } from '../sounds'

export class Sound extends Type<SoundDefinition> {
    private sound: ISound | null = null
    private callbacksQueue: string[] = []

    async init() {
        await this.loadSound(await this.engine.resolvePath(this.definition.FILENAME, 'Wavs'))
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    async tick(elapsedMS: number) {
        if (this.sound instanceof SimulatedSound) {
            this.sound.tick(elapsedMS)
        }

        while (this.callbacksQueue.length > 0) {
            await this.callbacks.run(this.callbacksQueue.shift()!)
        }
    }

    destroy() {
        if (this.sound !== null && this.sound.instances != null) {
            this.sound.destroy()
        }
    }

    // This argument is "PLAY" for kurator in intro for some reason
    @method()
    PLAY(arg?: any) {
        // Temporary hack, idk why it's needed for fanfary to run in Piraci:MAPA
        setTimeout(() => {
            assert(this.sound !== null)
            const instance = this.sound.play()
            assert(!(instance instanceof Promise), 'Sound should already be preloaded')
            this.onStart()
            instance.on('end', this.onEnd.bind(this))
        }, 0)
    }

    @method()
    ISPLAYING() {
        return this.sound !== null && this.sound.isPlaying
    }

    @method()
    STOP(arg?: boolean) {
        this.sound?.stop()
    }

    @method()
    RESUME() {
        this.sound?.resume()
    }

    @method()
    PAUSE() {
        this.sound?.pause()
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
        await this.loadSound(filename)
    }

    private async loadSound(path: string) {
        try {
            this.sound = await loadSound(this.engine.filesystem, await this.engine.resolvePath(path))
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
        this.callbacksQueue.push('ONSTARTED')
    }

    private onEnd() {
        console.debug(`Finished playing sound '${this.definition.FILENAME}'`)
        this.callbacksQueue.push('ONFINISHED')
    }
}

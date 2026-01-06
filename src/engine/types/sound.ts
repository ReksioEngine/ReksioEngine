import { Type } from './index'
import { loadSound } from '../../filesystem/assetsLoader'
import { SoundDefinition } from '../../fileFormats/cnv/types'
import { FileNotFoundError } from '../../filesystem/fileLoader'
import { assert, NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'
import { Sound as ISound } from '../audio'
import { logger } from '../logging'

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
        while (this.callbacksQueue.length > 0) {
            await this.callbacks.run(this.callbacksQueue.shift()!)
        }
    }

    destroy() {
        if (this.sound !== null) {
            this.sound.stop()
            this.sound = null
        }
    }

    // This argument is "PLAY" for kurator in intro for some reason
    @method()
    PLAY(arg?: any) {
        assert(this.sound !== null)
        this.sound.play({
            onStart: this.onStart.bind(this),
            onEnd: this.onEnd.bind(this),
        })
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
        this.destroy()
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
                logger.warn(
                    `Failed to load sound "${path}"`,
                    {
                        sound: this,
                    },
                    err
                )
            } else {
                throw err
            }
        }
    }

    private onStart() {
        logger.debug(`Playing sound '${this.definition.FILENAME}'`, {
            sound: this,
        })
        this.callbacksQueue.push('ONSTARTED')
    }

    private onEnd() {
        logger.debug(`Finished playing sound '${this.definition.FILENAME}'`, {
            sound: this,
        })
        this.callbacksQueue.push('ONFINISHED')
    }
}

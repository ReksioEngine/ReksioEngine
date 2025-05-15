import { IMedia, IMediaInstance } from '@pixi/sound/lib/interfaces'
import { CompleteCallback, PlayOptions } from '@pixi/sound/lib/Sound'
import { Sound, sound as pixiSound } from '@pixi/sound'

class UniversalSoundLibrary {
    private entries: Set<ISound> = new Set()
    private _speed: number = 1
    private _muted: boolean = false
    private _volume: number = 1

    get speedAll() {
        return this._speed
    }

    set speedAll(speed: number) {
        this._speed = speed
        pixiSound.speedAll = speed
        this.entries.forEach((entry: ISound) => (entry.speed = speed))
    }

    set disableAutoPause(value: boolean) {
        pixiSound.disableAutoPause = value
    }

    stopAll(exclude: (ISound | null)[] = []) {
        pixiSound.stopAll()
        this.entries.forEach((entry: ISound) => {
            if (!exclude.includes(entry)) {
                entry.stop()
            }
        })
    }

    resumeAll() {
        pixiSound.resumeAll()
        this.entries.forEach((entry: ISound) => entry.resume())
    }

    pauseAll() {
        pixiSound.pauseAll()
        this.entries.forEach((entry: ISound) => entry.pause())
    }

    muteAll() {
        this._muted = true
        pixiSound.muteAll()
        this.entries.forEach((entry: ISound) => (entry.muted = true))
    }

    unmuteAll() {
        this._muted = false
        pixiSound.unmuteAll()
        this.entries.forEach((entry: ISound) => (entry.muted = false))
    }

    get muted(): boolean {
        return this._muted
    }

    get volumeAll(): number {
        return this._volume
    }

    set volumeAll(volume: number) {
        this._volume = volume
        pixiSound.volumeAll = volume
        this.entries.forEach((entry: ISound) => (entry.volume = volume))
    }

    register(sound: ISound) {
        this.entries.add(sound)
    }
}

export const soundLibrary = new UniversalSoundLibrary()

export interface ISound {
    play(
        source?: string | PlayOptions | CompleteCallback,
        callback?: CompleteCallback
    ): IMediaInstance | Promise<IMediaInstance>

    stop(): this

    get muted(): boolean
    set muted(muted: boolean)

    get instances(): IMediaInstance[]
    destroy(): void

    get volume(): number
    set volume(volume: number)

    pause(): this
    resume(): this

    get speed(): number
    set speed(speed: number)

    get duration(): number
}

export class SimulatedSound implements ISound {
    private _speed: number = 1
    private _volume: number = 1
    private _muted: boolean = false

    private _instances: IMediaInstance[] = []
    private readonly _duration: number

    constructor(public realSound: Sound) {
        this._duration = realSound.duration

        this._muted = soundLibrary.muted
        this._speed = soundLibrary.speedAll
        this._volume = soundLibrary.volumeAll
        soundLibrary.register(this)
    }

    tick(elapsedMS: number) {
        for (const instance of this._instances) {
            if (instance instanceof SimulatedMediaInstance) {
                instance.tick(elapsedMS)
            }
        }
    }

    play(
        source?: string | PlayOptions | CompleteCallback,
        callback?: CompleteCallback
    ): IMediaInstance | Promise<IMediaInstance> {
        const instance = new SimulatedMediaInstance(this, this._speed, this._muted, this._volume)
        instance.play({})
        this._instances.push(instance)
        return instance
    }

    stop(): this {
        this._instances.forEach((instance) => instance.stop())
        return this
    }

    get muted(): boolean {
        return this._muted
    }

    set muted(muted: boolean) {
        this._muted = muted
        this._instances.forEach((instance) => (instance.muted = muted))
    }

    get instances(): IMediaInstance[] {
        return this._instances
    }

    destroy(): void {}

    get volume(): number {
        return this._volume
    }

    set volume(volume: number) {
        this._volume = volume
        this._instances.forEach((instance) => (instance.volume = this._volume))
    }

    pause(): this {
        this._instances.forEach((instance) => (instance.paused = true))
        return this
    }

    resume(): this {
        this._instances.forEach((instance) => (instance.paused = false))
        return this
    }

    get speed(): number {
        return this._speed
    }

    set speed(speed: number) {
        this._speed = speed
        this._instances.forEach((instance) => (instance.speed = this._speed))
    }

    get duration() {
        return this._duration
    }
}

export class SimulatedMediaInstance implements IMediaInstance {
    id: number = 0
    progress: number = 0
    paused: boolean = false
    volume: number = 1
    speed: number = 1
    loop: boolean = false
    muted: boolean = false

    private events: Record<string, ((...args: any[]) => any[])[]> = {
        resumed: [],
        paused: [],
        start: [],
        end: [],
        progress: [],
        pause: [],
        stop: [],
    }

    private timeCounter: number = 0
    private running: boolean = false

    constructor(
        private sound: SimulatedSound,
        speed: number,
        muted: boolean,
        volume: number
    ) {
        this.speed = speed
        this.muted = muted
        this.volume = volume
    }

    tick(elapsedMS: number) {
        if (!this.running || this.paused) {
            return
        }

        this.timeCounter += elapsedMS * this.speed
        if (this.timeCounter >= this.sound.duration * 1000) {
            for (const endEvent of this.events['end']) {
                endEvent()
            }

            this.timeCounter = 0
            this.running = false
        }
    }

    stop(): void {
        this.running = false
    }

    refresh(): void {
        throw new Error('Method not implemented.')
    }

    refreshPaused(): void {
        throw new Error('Method not implemented.')
    }

    init(parent: IMedia): void {
        throw new Error('Method not implemented.')
    }

    play(options: PlayOptions): void {
        this.running = true
        for (const playEvent of this.events['start']) {
            playEvent()
        }
    }

    destroy(): void {
        this.stop()
    }

    toString(): string {
        throw new Error('Method not implemented.')
    }

    once(event: unknown, fn: unknown, context?: unknown): this {
        throw new Error('Method not implemented.')
    }

    on(event: string, fn: unknown, context?: unknown): this {
        this.events[event].push(fn as any)
        return this
    }

    off(
        event: 'resumed' | 'paused' | 'start' | 'end' | 'progress' | 'pause' | 'stop',
        fn?: (...args: any[]) => void,
        context?: any,
        once?: boolean
    ): this {
        this.events[event] = this.events[event].filter((event) => event !== fn)
        return this
    }

    set(name: 'speed' | 'volume' | 'muted' | 'loop' | 'paused', value: number | boolean): this {
        throw new Error('Method not implemented.')
    }
}

export type PlayOptions = {
    volume?: number // 0..1
    loop?: boolean
    rate?: number
    start?: number

    onStart?: () => void
    onEnd?: () => void
    onStop?: () => void
}

export class SoundInstance extends EventTarget {
    private parentSound: Sound

    private readonly ctx: AudioContext
    private readonly gain: GainNode

    private _isPlaying = false
    private _volume = 1
    private _muted = false

    private source: AudioBufferSourceNode | null = null
    private startedAt = 0
    private offset = 0
    private currentRate: number
    private initialOpts: Required<Pick<PlayOptions, 'loop' | 'rate'>> & PlayOptions

    private finished = false
    private stopRequested = false

    constructor(ctx: AudioContext, parentSound: Sound, master: GainNode, opts: PlayOptions = {}) {
        super()
        this.ctx = ctx
        this.parentSound = parentSound
        this.gain = new GainNode(ctx)
        this.gain.connect(master)

        this.initialOpts = {
            loop: opts.loop ?? false,
            rate: opts.rate ?? 1,
            ...opts,
        }

        this.currentRate = this.initialOpts.rate
        this._volume = opts.volume ?? 1
    }

    private cleanupSource() {
        if (!this.source) return
        try {
            this.source.disconnect()
        } catch {
            /* ignore */
        }
        this.source = null
    }

    private finalize(reason: 'end' | 'stop' | 'pause') {
        if (this.finished) return
        this.finished = true

        this._isPlaying = false
        this.cleanupSource()

        // Remove from parent list so instances don’t accumulate
        this.parentSound._removeInstance(this)

        if (reason === 'end') this.initialOpts.onEnd?.()
        if (reason === 'stop') this.initialOpts.onStop?.()
    }

    private buildSource() {
        const src = new AudioBufferSourceNode(this.ctx, { buffer: this.parentSound.buffer })
        src.loop = this.initialOpts.loop
        src.playbackRate.value = this.initialOpts.rate
        src.connect(this.gain)

        src.addEventListener('ended', () => {
            if (this.stopRequested) this.finalize('stop')
            else this.finalize('end')
        })

        this.source = src
        return src
    }

    play() {
        this.finished = false
        this.stopRequested = false

        const src = this.buildSource()
        const startOffset = Math.max(0, this.initialOpts.start ?? this.offset)
        this.offset = startOffset
        this.startedAt = this.ctx.currentTime

        src.start(0, startOffset)
        this._isPlaying = true
        this.initialOpts.onStart?.()

        return this
    }

    stop() {
        if (!this.source || this.finished) return
        this.stopRequested = true

        try {
            this.source.stop()
        } catch {
            /* ignore */
        }
        this.finalize('stop')
        this.offset = 0
    }

    pause() {
        if (!this.source || this.finished) return

        const elapsed = (this.ctx.currentTime - this.startedAt) * this.currentRate
        this.offset = (this.offset + elapsed) % this.parentSound.buffer.duration

        try {
            this.source.stop()
        } catch {
            /* ignore */
        }
        this.finalize('pause')
    }

    resume() {
        if (this.source || !this.finished) return
        this.play()
    }

    get isPlaying() {
        return this._isPlaying
    }

    private applyGain(): void {
        // If muted or volume is out of range, clamp accordingly
        this.gain.gain.value = this._muted ? 0 : Math.max(0, Math.min(1, this._volume))
    }

    get volume() {
        return this._volume
    }

    set volume(v: number) {
        this._volume = v
        this.applyGain()
    }

    get muted() {
        return this._muted
    }

    set muted(v: boolean) {
        this._muted = v
        this.applyGain()
    }

    set speed(v: number) {
        const newRate = Math.max(0.01, v)
        if (this.source) {
            const elapsed = (this.ctx.currentTime - this.startedAt) * this.currentRate
            this.offset = (this.offset + elapsed) % this.parentSound.buffer.duration
            this.startedAt = this.ctx.currentTime

            this.source.playbackRate.value = newRate
        }

        this.currentRate = newRate
    }

    get speed() {
        return this.currentRate
    }
}

export class Sound {
    public instances: SoundInstance[] = []

    constructor(
        private manager: AudioManager,
        public buffer: AudioBuffer
    ) {}

    _removeInstance(inst: SoundInstance) {
        const i = this.instances.indexOf(inst)
        if (i >= 0) this.instances.splice(i, 1)
    }

    play(opts: PlayOptions = {}) {
        const instance = new SoundInstance(this.manager.ctx, this, this.manager.master, {
            rate: this.manager.speed,
            ...opts,
        })
        this.instances.push(instance)
        return instance.play()
    }

    stop() {
        for (const inst of [...this.instances]) {
            inst.stop()
        }
    }

    pause() {
        this.instances.slice().forEach((inst) => inst.pause())
    }

    resume() {
        this.instances.slice().forEach((inst) => inst.resume())
    }

    get isPlaying() {
        return this.instances.some((instance) => instance.isPlaying)
    }
}

export class AudioManager {
    readonly ctx = new AudioContext()
    readonly master = new GainNode(this.ctx)
    private sounds: Sound[] = []
    public speed: number = 1

    constructor() {
        this.master.connect(this.ctx.destination)
        this.master.gain.value = 1
    }

    setMasterVolume(v: number) {
        this.master.gain.value = Math.max(0, Math.min(1, v))
    }

    async load(dataBuffer: ArrayBuffer) {
        const buf = await this.ctx.decodeAudioData(dataBuffer)
        if (!buf) throw new Error('Failed to decode audio data')
        const sound = new Sound(this, buf)
        this.sounds.push(sound)
        return sound
    }

    stopAll() {
        for (const sound of [...this.sounds]) {
            sound.stop()
        }
    }

    setGlobalRate(v: number) {
        this.speed = v
        this.sounds.forEach((s) => s.instances.forEach((instance) => (instance.speed = this.speed)))
    }

    pause() {
        this.sounds.forEach((s) => s.pause())
    }

    resume() {
        this.sounds.forEach((s) => s.resume())
    }
}

export const globalAudio = new AudioManager()

import {Type} from './index'
import {Engine} from '../index'
import {SequenceDefinition} from '../../fileFormats/cnv/types'
import {FileNotFoundError} from '../filesLoader'
import {
    ParameterSequence,
    SequenceFile,
    SequenceFileEntry,
    SequenceSequence,
    Simple,
    Speaking
} from '../../fileFormats/seq'
import {assert, NotImplementedError} from '../../errors'
import {Animo} from './animo'
import {loadSound} from '../assetsLoader'
import {Sound} from '@pixi/sound'
import {createObject} from '../definitionLoader'

const paramsCharacterSet = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{|}~'

export class Sequence extends Type<SequenceDefinition> {
    private sequenceFile: SequenceFile | null = null
    private parametersMapping: Map<string, number> = new Map()
    private subEntries: Map<string, SequenceFileEntry[]> = new Map<string, SequenceFileEntry[]>()
    private parameterSequence: ParameterSequence | null = null

    private sounds: Map<string, Sound> = new Map()

    private queue: SequenceFileEntry[] = []
    private activeAnimo: Animo | null = null
    private currentAnimoEvent: string | null = null
    private sequenceName: string | null = null
    private runningSubSequence: SequenceFileEntry | null = null

    private loop: boolean = false
    private loopIndex: number = 0

    private readonly onAnimoEventFinishedCallback: (eventName: string) => Promise<void>

    constructor(engine: Engine, definition: SequenceDefinition) {
        super(engine, definition)
        this.callbacks.register('ONINIT', definition.ONINIT)
        this.callbacks.registerGroup('ONFINISHED', definition.ONFINISHED)
        this.onAnimoEventFinishedCallback = this.onAnimoEventFinished.bind(this)
    }

    async init() {
        const relativePath = this.engine.currentScene?.getRelativePath(this.definition.FILENAME)
        if (relativePath == undefined) {
            throw new FileNotFoundError('Could not get scene directory path')
        }

        this.sequenceFile = await this.engine.fileLoader.getSequenceFile(relativePath)
        await this.load()
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    private async load() {
        assert(this.sequenceFile !== null)

        const soundsNames = []
        for (const definition of Object.values(this.sequenceFile)) {
            if (definition.TYPE === 'SEQUENCE') {
                const sequence = definition as SequenceSequence
                if (sequence.MODE === 'PARAMETER') {
                    this.parameterSequence = sequence as ParameterSequence
                    assert(this.parameterSequence.SEQEVENT !== undefined)

                    for (const [name, indexer] of Object.entries(this.parameterSequence.SEQEVENT)) {
                        this.parametersMapping.set(name, paramsCharacterSet.indexOf(indexer))
                    }
                }
            } else if (definition.TYPE === 'SPEAKING') {
                const sequence = definition as Speaking
                soundsNames.push(sequence.WAVFN)
            }

            if (definition.ADD) {
                let subEntries: SequenceFileEntry[] = []
                if (this.subEntries.has(definition.ADD)) {
                    subEntries = this.subEntries.get(definition.ADD)!
                }

                subEntries.push(definition)
                this.subEntries.set(definition.ADD, subEntries)
            }
        }

        const sounds = await Promise.all(soundsNames.map(name => loadSound(this.engine.fileLoader, `Wavs/${name}`)))
        for (let i = 0; i < sounds.length; i++) {
            this.sounds.set(soundsNames[i], sounds[i])
        }
    }

    PLAY(sequenceName: string) {
        assert(this.parameterSequence !== null && this.subEntries !== null)

        const subEntries = this.subEntries.get(this.parameterSequence.NAME)
        if (subEntries !== undefined && this.parametersMapping.has(sequenceName)) {
            const entryIndex = this.parametersMapping.get(sequenceName)!
            const entry = subEntries[entryIndex]
            this.sequenceName = sequenceName
            this.fillQueue(entry)
            this.progressNext()
        }
    }

    private fillQueue(entry: SequenceFileEntry) {
        this.queue.push(entry)

        if (!this.subEntries.has(entry.NAME)) {
            return
        }

        let subEntries = this.subEntries.get(entry.NAME)!
        if (entry.MODE === 'RANDOM') {
            subEntries = subEntries
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        }

        for (const subEntry of subEntries) {
            this.fillQueue(subEntry)
        }
    }

    private async onAnimoEventFinished(eventName: string) {
        assert(this.activeAnimo !== null)

        if (this.currentAnimoEvent === eventName) {
            await this.progressNext()
        } else if (this.loop && this.runningSubSequence !== null) {
            let eventName = `${this.runningSubSequence.PREFIX}_${this.loopIndex++}`
            if (!this.activeAnimo.hasEvent(eventName)) {
                this.loopIndex = 1
                eventName = `${this.runningSubSequence.PREFIX}_${this.loopIndex}`
            }

            this.activeAnimo!.playEvent(eventName)
        }
    }

    private async progressNext() {
        if (this.sequenceName === null) {
            return
        }

        if (this.queue.length === 0) {
            this.callbacks.run('ONFINISHED', this.sequenceName)
            return
        }

        const next = this.queue.shift()!
        if (next.TYPE === 'SEQUENCE') {
            await this.progressNext()
            return
        }

        if (next.TYPE === 'SPEAKING') {
            const speaking = next as Speaking

            if (this.activeAnimo?.definition.FILENAME !== speaking.ANIMOFN) {
                if (this.activeAnimo) {
                    this.activeAnimo.events.unregister(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
                }

                this.activeAnimo = await this.getAnimo(speaking.ANIMOFN)
                if (this.activeAnimo) {
                    this.activeAnimo.events.register(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
                }
            }

            if (this.activeAnimo) {
                const sound = this.sounds.get(speaking.WAVFN)!
                const instance = await sound.play()

                instance.on('start', () => {
                    if (speaking.STARTING) {
                        this.currentAnimoEvent = speaking.PREFIX + '_START'
                        this.activeAnimo!.playEvent(speaking.PREFIX + '_START')
                    }
                })
                instance.on('end', async () => {
                    if (speaking.ENDING) {
                        this.currentAnimoEvent = speaking.PREFIX + '_STOP'
                        this.activeAnimo!.playEvent(speaking.PREFIX + '_STOP')
                        this.loop = false
                    }
                })

                this.runningSubSequence = speaking

                if (this.activeAnimo.hasEvent(speaking.PREFIX + '_1')) {
                    this.loop = true
                    this.loopIndex = 1
                    this.activeAnimo!.playEvent(speaking.PREFIX + '_1')
                }
            }
        } else if (next.TYPE === 'SIMPLE') {
            const simple = next as Simple

            if (this.activeAnimo?.definition.FILENAME !== simple.FILENAME) {
                if (this.activeAnimo) {
                    this.activeAnimo.events.unregister(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
                }

                this.activeAnimo = await this.getAnimo(simple.FILENAME)
                if (this.activeAnimo) {
                    this.activeAnimo.events.register(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
                }
            }

            if (this.activeAnimo) {
                if (!this.activeAnimo.hasEvent(simple.EVENT)) {
                    await this.progressNext()
                    return
                }

                this.currentAnimoEvent = simple.EVENT
                this.runningSubSequence = simple
                this.activeAnimo.playEvent(simple.EVENT)
            }
        }
    }

    private async getAnimo(source: string) {
        const object = this.engine.getObject(source)
        if (object) {
            return object
        }

        for (const object of Object.values(this.engine.scope)) {
            if (object instanceof Animo) {
                if (object.definition.FILENAME === source) {
                    return object
                }
            }
        }

        return await createObject(this.engine, {
            TYPE: 'ANIMO',
            NAME: source,
            FILENAME: source,
            FPS: 16,
            MONITORCOLLISION: false,
            MONITORCOLLISIONALPHA: false,
            PRELOAD: true,
            PRIORITY: 0,
            RELEASE: true,
            TOCANVAS: true,
            TOINI: false,
            VISIBLE: true
        }) as Animo
    }

    ISPLAYING() {
        throw new NotImplementedError()
    }

    HIDE() {
        throw new NotImplementedError()
    }

    STOP(arg: boolean) {
        this.queue = []
        this.sequenceName = null
        this.runningSubSequence = null
        this.loop = false
        this.loopIndex = 0
        this.activeAnimo?.events.unregister(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
        this.activeAnimo = null
    }
}

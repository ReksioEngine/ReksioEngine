import { Type } from './index'
import { Engine } from '../index'
import { SequenceDefinition } from '../../fileFormats/cnv/types'
import { FileNotFoundError } from '../../loaders/filesLoader'
import {
    ParameterSequence,
    SequenceFile,
    SequenceFileEntry,
    SequenceSequence,
    Simple,
    Speaking,
} from '../../fileFormats/seq'
import { assert } from '../../common/errors'
import { Animo } from './animo'
import { loadSound } from '../../loaders/assetsLoader'
import { IMediaInstance } from '@pixi/sound'
import { createObject } from '../../loaders/definitionLoader'
import { method } from '../../common/types'
import { ISound, SimulatedMediaInstance } from '../sounds'

const paramsCharacterSet = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{|}~'

export class Sequence extends Type<SequenceDefinition> {
    private sequenceFile: SequenceFile | null = null
    private parametersMapping: Map<string, number> = new Map()
    private subEntries: Map<string, SequenceFileEntry[]> = new Map<string, SequenceFileEntry[]>()
    private parameterSequence: ParameterSequence | null = null

    private allAnimoFilenames: Set<string> = new Set()
    private allAnimoObjects = new Map<string, Animo>()

    private sounds: Map<string, ISound> = new Map()
    private endedSpeakingSoundsQueue: Speaking[] = []

    private queue: SequenceFileEntry[] = []
    private activeAnimo: Animo | null = null
    private playingSound: IMediaInstance | null = null
    private currentAnimoEvent: string | null = null
    private sequenceName: string | null = null
    private runningSubSequence: SequenceFileEntry | null = null

    private loop: boolean = false
    private loopIndex: number = 0

    private readonly onAnimoEventFinishedCallback: (eventName: string) => void

    constructor(engine: Engine, parent: Type<any> | null, definition: SequenceDefinition) {
        super(engine, parent, definition)
        this.onAnimoEventFinishedCallback = this.onAnimoEventFinished.bind(this)
    }

    async init() {
        const relativePath = this.engine.currentScene?.getRelativePath(this.definition.FILENAME)
        if (relativePath == undefined) {
            throw new FileNotFoundError('Could not get scene directory path')
        }

        this.sequenceFile = await this.engine.fileLoader.getSequenceFile(relativePath)
        await this.load()

        for (const animoFilename of this.allAnimoFilenames) {
            this.allAnimoObjects.set(animoFilename, await this.getAnimo(animoFilename))
        }
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    destroy() {
        this.playingSound?.destroy()
    }

    private async load() {
        assert(this.sequenceFile !== null)

        const soundsNames = []
        for (const definition of this.sequenceFile) {
            if (definition.TYPE === 'SEQUENCE') {
                const sequence = definition as SequenceSequence
                if (sequence.MODE === 'PARAMETER') {
                    this.parameterSequence = sequence as ParameterSequence
                    assert(this.parameterSequence.SEQEVENT !== undefined)

                    for (const [name, indexer] of this.parameterSequence.SEQEVENT) {
                        // It seems that only first letter matters as in S56_0_WIOSKA (Ufo)
                        // they accidentally added extra character and it still works
                        this.parametersMapping.set(name, paramsCharacterSet.indexOf(indexer.charAt(0)))
                    }
                }
            } else if (definition.TYPE === 'SPEAKING') {
                const sequence = definition as Speaking
                soundsNames.push(sequence.WAVFN)
                this.allAnimoFilenames.add(definition.ANIMOFN)
            } else if (definition.TYPE === 'SIMPLE') {
                this.allAnimoFilenames.add(definition.FILENAME)
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

        const sounds = await Promise.all(
            soundsNames.map(async (name: string): Promise<ISound> => {
                console.debug(`Preloading sound ${name}...`)
                return loadSound(this.engine.fileLoader, `Wavs/${name}`)
            })
        )
        for (let i = 0; i < sounds.length; i++) {
            this.sounds.set(soundsNames[i], sounds[i])
        }
    }

    tick(elapsedMS: number) {
        if (this.playingSound instanceof SimulatedMediaInstance) {
            this.playingSound.tick(elapsedMS)
        }

        while (this.endedSpeakingSoundsQueue.length > 0) {
            this.loop = false
            const entry = this.endedSpeakingSoundsQueue.shift()!
            const stopEvent = entry.PREFIX + '_STOP'
            if (entry.ENDING && this.activeAnimo?.hasEvent(stopEvent)) {
                this.playAnimoEvent(stopEvent)
            } else {
                this.activeAnimo?.STOP(true)
                this.progressNext()
            }
        }
    }

    @method()
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

    @method()
    ISPLAYING() {
        return this.sequenceName !== null
    }

    @method()
    HIDE() {
        assert(this.sequenceFile !== null)

        // HIDE() might be called before sequence is playing, so we can't just hide activeAnimo
        // because activeAnimo would be null at that point, we don't know what sequence is gonna be played
        for (const object of this.allAnimoObjects.values()) {
            object.HIDE()
        }
    }

    @method()
    STOP(arg?: boolean) {
        this.queue = []
        this.sequenceName = null
        this.runningSubSequence = null
        this.loop = false
        this.loopIndex = 0
        this.activeAnimo?.events.unregister(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
        this.activeAnimo = null
        this.playingSound?.stop()
    }

    private fillQueue(entry: SequenceFileEntry) {
        this.queue.push(entry)

        if (!this.subEntries.has(entry.NAME)) {
            return
        }

        const subEntries = this.subEntries.get(entry.NAME)!
        if (entry.MODE === 'RANDOM') {
            const subEntry = subEntries[Math.floor(Math.random() * subEntries.length)]
            this.fillQueue(subEntry)
        } else {
            for (const subEntry of subEntries) {
                this.fillQueue(subEntry)
            }
        }
    }

    private onAnimoEventFinished(eventName: string) {
        assert(this.activeAnimo !== null)

        if (this.runningSubSequence?.TYPE === 'SPEAKING') {
            const prefix = this.runningSubSequence.PREFIX;
            if (this.runningSubSequence.STARTING && eventName === `${prefix}_START`) {
                if (this.activeAnimo.hasEvent(eventName = `${prefix}_1`) || this.activeAnimo.hasEvent(eventName = prefix)) {
                    this.loop = true
                    this.loopIndex = eventName === prefix ? 0 : 1
                    this.playAnimoEvent(eventName)
                }
            } else if (this.runningSubSequence.ENDING && eventName === prefix + '_STOP') {
                this.progressNext()
            } else if (this.loop && this.loopIndex === 0) {
                this.playAnimoEvent(eventName)
            } else if (this.loop && this.loopIndex !== 0) {
                let eventName = `${prefix}_${this.loopIndex++}`
                if (!this.activeAnimo.hasEvent(eventName)) {
                    this.loopIndex = 1
                    eventName = `${prefix}_${this.loopIndex}`
                }
                this.playAnimoEvent(eventName)
            }
        } else if (this.currentAnimoEvent == eventName) {
            this.progressNext()
        }
    }

    private progressNext() {
        if (this.sequenceName === null) {
            return
        }

        if (this.queue.length === 0) {
            const finishedName = this.sequenceName
            this.sequenceName = null
            this.callbacks.run('ONFINISHED', finishedName)
            return
        }

        const next = this.queue.shift()!
        if (next.TYPE === 'SEQUENCE') {
            this.progressNext()
            return
        }

        if (next.TYPE === 'SPEAKING') {
            const speaking = next as Speaking

            if (this.activeAnimo?.definition.FILENAME !== speaking.ANIMOFN) {
                if (this.activeAnimo) {
                    this.activeAnimo.events.unregister(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
                }

                const animoObject = this.allAnimoObjects.get(speaking.ANIMOFN)
                if (animoObject) {
                    this.activeAnimo = animoObject
                    animoObject.events.register(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
                }
            }

            if (this.activeAnimo) {
                if (this.playingSound) {
                    this.playingSound.stop()
                    this.playingSound = null
                }

                console.debug(`Playing sound '${speaking.WAVFN}'`)
                const sound = this.sounds.get(speaking.WAVFN)!
                const instance = sound.play()
                assert(!(instance instanceof Promise), 'Sound should already be preloaded')
                instance.on('end', () => {
                    this.endedSpeakingSoundsQueue.push(speaking)
                })
                this.playingSound = instance

                let eventName;
                const prefix = speaking.PREFIX;
                if (speaking.STARTING && this.activeAnimo.hasEvent(eventName = `${prefix}_START`)) {
                    this.playAnimoEvent(eventName)
                } else if (this.activeAnimo.hasEvent(eventName = `${prefix}_1`) || this.activeAnimo.hasEvent(eventName = prefix)) {
                    this.loop = true
                    this.loopIndex = eventName === eventName ? 0 : 1
                    this.playAnimoEvent(eventName)
                }

                this.runningSubSequence = speaking
            }
        } else if (next.TYPE === 'SIMPLE') {
            const simple = next as Simple

            if (this.activeAnimo?.definition.FILENAME !== simple.FILENAME) {
                if (this.activeAnimo) {
                    this.activeAnimo.events.unregister(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
                }

                const animoObject = this.allAnimoObjects.get(simple.FILENAME)
                if (animoObject) {
                    this.activeAnimo = animoObject
                    animoObject.events.register(Animo.Events.ONFINISHED, this.onAnimoEventFinishedCallback)
                }
            }

            if (this.activeAnimo) {
                let eventName = simple.EVENT

                // Play first event if event name is incorrect
                if (!this.activeAnimo.hasEvent(eventName)) {
                    const allEvents = this.activeAnimo.getAllEvents()
                    if (allEvents.length === 0) {
                        this.progressNext()
                        return
                    }
                    eventName = allEvents[0].name
                }

                this.runningSubSequence = simple
                this.playAnimoEvent(eventName)
            }
        }
    }

    private playAnimoEvent(eventName: string) {
        this.currentAnimoEvent = eventName
        this.activeAnimo?.playEvent(eventName)
    }

    private async getAnimo(nameOrFilename: string): Promise<Animo> {
        // Get object by name
        const object = this.engine.getObject(nameOrFilename)
        if (object) {
            return object
        }

        // Get existing object by filename
        const existingObject: Animo | null = this.engine.scopeManager.find(
            (key: string, object) => object instanceof Animo && object.definition.FILENAME === nameOrFilename
        )
        if (existingObject != null) {
            return existingObject
        }

        // Create a new ANIMO if object doesn't exist
        return (await createObject(
            this.engine,
            {
                TYPE: 'ANIMO',
                NAME: nameOrFilename,
                FILENAME: nameOrFilename,
                FPS: 16,
                MONITORCOLLISION: false,
                MONITORCOLLISIONALPHA: false,
                PRELOAD: true,
                PRIORITY: 0,
                RELEASE: true,
                TOCANVAS: true,
                TOINI: false,
                VISIBLE: true,
            },
            null
        )) as Animo
    }
}

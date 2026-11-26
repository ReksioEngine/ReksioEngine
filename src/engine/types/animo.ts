import { DisplayType, ParentType, XRayInfo } from './index'
import { AnimoDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert, InvalidObjectError } from '../../common/errors'
import * as PIXI from 'pixi.js'
import { Graphics, Rectangle, Sprite, Texture } from 'pixi.js'
import { ANN, AnimoFlags, Event, EventFlags } from '../../fileFormats/ann'
import { ButtonLogicComponent, Event as FSMEvent, State } from '../components/button'
import { loadSound } from '../../filesystem/assetsLoader'
import { FileNotFoundError } from '../../filesystem/fileLoader'
import { AdvancedSprite, createHitmapFromImageBytes } from '../rendering'
import { method, int } from '../../common/types'
import { CollisionsComponent } from '../components/collisions'
import { Sound, SoundInstance } from '../audio'
import { logger } from '../logging'

export class Animo extends DisplayType<AnimoDefinition> {
    private buttonLogic: ButtonLogicComponent
    readonly collisions: CollisionsComponent

    public isPlaying: boolean = false
    private currentFrame: number = 0
    private currentEvent: Event | null = null

    private loopsDone = new Map<Event, number>() // piklib would store it in event's struct
    private playingBackwards: boolean = false
    private lastSound: SoundInstance | null = null
    private isPaused: boolean = false
    private buttonInteractArea: Graphics | null = null

    private fps: number = 16
    private timeSinceLastFrame: number = 0

    private positionX: number = 0
    private positionOffsetX: number = 0
    private positionY: number = 0
    private positionOffsetY: number = 0

    public anchorOffsetX: number = 0
    public anchorOffsetY: number = 0

    private annFile: ANN | null = null
    private sprite: AdvancedSprite | null = null

    private textures = new Map<number, PIXI.Texture>()
    private hitmaps = new Map<number, Uint8Array>()
    private sounds = new Map<string, Sound>()

    public static Events = {
        ONFINISHED: 'ONFINISHED',
        ONSTARTED: 'ONSTARTED',
    }

    constructor(engine: Engine, parent: ParentType<any> | null, definition: AnimoDefinition) {
        super(engine, parent, definition)
        this.fps = definition.FPS ?? 16
        this.collisions = new CollisionsComponent(engine, this)
        this.buttonLogic = new ButtonLogicComponent(this.onButtonStateChange.bind(this))
    }

    async init() {
        this.annFile = await this.loadAnimation(this.definition.FILENAME)
    }

    async applyDefaults() {
        const existingObjectWithFilename: Animo | null = this.engine.scopeManager.find(
            (key: string, object) =>
                object !== this &&
                object instanceof Animo &&
                object.definition.FILENAME === this.definition.FILENAME &&
                object.sprite != null
        )
        if (existingObjectWithFilename != null) {
            this.sprite = existingObjectWithFilename.sprite
        } else {
            await this.initSprite()
        }
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    destroy() {
        if (this.sprite !== null) {
            this.engine.rendering.removeFromStage(this.sprite)
        }
        if (this.buttonInteractArea !== null) {
            this.buttonLogic.unregisterInteractive(this.buttonInteractArea)
            this.engine.rendering.removeFromStage(this.buttonInteractArea)
        }
        for (const sound of this.sounds.values()) {
            sound.stop()
        }
        this.sounds.clear()
    }

    async tick(elapsedMS: number) {
        await this.buttonLogic.tick()
        this.collisions.tick()

        if (!this.isPlaying) {
            return
        }

        this.timeSinceLastFrame += elapsedMS * this.engine.speed

        const frameLength = (1 / this.fps) * 1000
        while (this.isPlaying && this.timeSinceLastFrame >= frameLength) {
            await this.tickAnimation()
            this.timeSinceLastFrame -= frameLength
        }
    }

    public getDefaultEvent() {
        assert(this.annFile !== null)
        // Find first event with any frames
        const defaultEvent = this.annFile.events.find((event) => event.framesCount > 0)
        if (defaultEvent !== undefined) {
            return defaultEvent.name
        }
        return null
    }

    private async loadAnimation(path: string) {
        try {
            const relativePath = this.engine.currentScene
                ? await this.engine.currentScene.getRelativePath(path)
                : await this.engine.resolvePath(path)

            const annFile = await this.engine.filesystem.getANNFile(relativePath)
            await this.loadSfx(annFile)

            logger.debug(`ANN file '${path}' loaded successfully!`, {
                animo: this,
                annFile,
            })
            return annFile
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                throw new InvalidObjectError('ANN file not found')
            }
            throw err
        }
    }

    private async loadSfx(annFile: ANN) {
        const loadSoundIfNotExists = async (filename: string) => {
            const normalizedSFXFilename = filename.toLowerCase().replace('sfx\\', '')
            const resolvedPath = await this.engine.resolvePath(normalizedSFXFilename, 'wavs/sfx')
            try {
                const sound = await loadSound(this.engine.filesystem, resolvedPath)
                this.sounds.set(filename, sound)
            } catch (err) {
                logger.warn(
                    'Failed to load sfx sound',
                    {
                        animo: this,
                        filename,
                        resolvedPath,
                    },
                    err
                )
            }
        }

        const soundsNames = new Set<string>()
        for (const event of annFile.events) {
            for (const frame of event.frames) {
                frame.sounds.forEach((name) => soundsNames.add(name))
            }
        }

        await Promise.all([...soundsNames].map(loadSoundIfNotExists))
    }

    private async initSprite() {
        assert(this.annFile !== null)

        this.sprite = new AdvancedSprite()
        this.sprite.name = `${this.name} [ANIMO]` // For PIXI Devtools
        this.sprite.eventMode = 'none'
        this.sprite.visible = this.definition.VISIBLE
        this.setPriority(this.definition.PRIORITY ?? 0)

        if (this.definition.TOCANVAS) {
            this.engine.rendering.addToStage(this.sprite)
        }

        this.currentEvent = this.getEvent(this.getDefaultEvent() ?? '')
        if (this.currentEvent) {
            await this.changeFrame(this.currentEvent, 0, false)
        }
    }

    private getTexture(imageIndex: number): Texture {
        assert(this.annFile != null)

        // Check if cached already
        if (this.textures.has(imageIndex)) {
            return this.textures.get(imageIndex)!
        }

        const baseTexture = PIXI.BaseTexture.fromBuffer(
            new Uint8Array(this.annFile.images[imageIndex]),
            this.annFile.annImages[imageIndex].width,
            this.annFile.annImages[imageIndex].height
        )

        const texture = new PIXI.Texture(baseTexture)
        this.textures.set(imageIndex, texture)
        return texture
    }

    private getHitmap(imageIndex: number): Uint8Array {
        assert(this.annFile != null)

        if (this.hitmaps.has(imageIndex)) {
            return this.hitmaps.get(imageIndex)!
        }

        const hitmap = createHitmapFromImageBytes(this.annFile.images[imageIndex])
        this.hitmaps.set(imageIndex, hitmap)
        return hitmap
    }

    private async tickAnimation() {
        assert(this.annFile !== null && this.sprite !== null)

        const event = this.currentEvent
        if (!event) {
            return
        }

        if (this.playingBackwards) {
            await this.previousFrame(event)
        } else {
            await this.nextFrame(event)
        }
    }

    private async nextFrame(event: Event) {
        const frame = this.currentFrame
        const nextFrame = frame + 1

        if (event.loopFramesEndIndex === 0) {
            if (nextFrame >= event.framesCount) {
                if (!this.hasAnimoFlag(AnimoFlags.NEXT_EVENT_AT_END)) {
                    await this.stop(true)
                } else if (!(await this.switchToNextEvent(event))) {
                    await this.showFrame(event, frame)
                }
                return
            }
            await this.showFrame(event, nextFrame)
            return
        }

        if (nextFrame <= event.loopFramesEndIndex) {
            // event with the loop end past its last frame never finishes
            if (nextFrame < event.framesCount) {
                await this.showFrame(event, nextFrame)
            }
            return
        }

        if (this.hasEventFlag(event, EventFlags.PING_PONG)) {
            this.playingBackwards = true
            await this.showFrame(event, frame - 1)
            return
        }

        if (!this.hasEventFlag(event, EventFlags.LOOP_WHILE_SOUND) || this.isSoundPlaying()) {
            if (event.loopRepeatsCount !== 0) {
                const loopsDone = (this.loopsDone.get(event) ?? 0) + 1
                if (loopsDone >= event.loopRepeatsCount) {
                    this.loopsDone.set(event, 0)
                    await this.stop(true)
                    await this.showFrameAfterStop(event, nextFrame)
                    return
                }
                this.loopsDone.set(event, loopsDone)
            }
            await this.showFrame(event, event.loopFramesStartIndex)
            return
        }

        if (nextFrame >= event.framesCount) {
            if (!this.hasAnimoFlag(AnimoFlags.NEXT_EVENT_AT_END) || !(await this.switchToNextEvent(event))) {
                await this.stop(true)
            }
            return
        }

        if (frame + 2 < event.framesCount) {
            await this.showFrame(event, frame + 2)
            return
        }

        if (!this.hasAnimoFlag(AnimoFlags.NEXT_EVENT_AT_END)) {
            await this.stop(true)
            await this.showFrameAfterStop(event, nextFrame)
        } else if (!(await this.switchToNextEvent(event))) {
            await this.showFrame(event, nextFrame)
        }
    }

    private async previousFrame(event: Event) {
        const frame = this.currentFrame
        const previousFrame = frame - 1

        if (event.loopFramesEndIndex === 0) {
            if (previousFrame < 0) {
                await this.stop(true)
            } else {
                await this.showFrame(event, previousFrame)
            }
            return
        }

        if (previousFrame >= event.loopFramesStartIndex) {
            await this.showFrame(event, previousFrame)
            return
        }

        if (this.hasEventFlag(event, EventFlags.PING_PONG)) {
            this.playingBackwards = false
            await this.showFrame(event, frame + 1)
            return
        }

        if (this.hasEventFlag(event, EventFlags.LOOP_WHILE_SOUND) && !this.isSoundPlaying()) {
            if (previousFrame !== 0) {
                if (previousFrame >= 0) {
                    await this.showFrame(event, previousFrame)
                }
                return
            }
            await this.stop(true)
            await this.showFrameAfterStop(event, event.loopFramesEndIndex)
            return
        }

        await this.showFrame(event, event.loopFramesEndIndex)
    }

    // ONSTARTED not called on purpose (like in piklib)
    private async switchToNextEvent(event: Event) {
        assert(this.annFile !== null)
        const nextEvent = this.annFile.events[this.annFile.events.indexOf(event) + 1]
        if (nextEvent === undefined || nextEvent.framesCount === 0) {
            return false
        }
        this.currentEvent = nextEvent
        await this.showFrame(nextEvent, 0)
        return true
    }

    private async showFrameAfterStop(event: Event, frameIdx: number) {
        if (!this.isPlaying && this.currentEvent === event && frameIdx < event.framesCount) {
            await this.showFrame(event, frameIdx)
        }
    }

    private hasAnimoFlag(flag: number) {
        assert(this.annFile !== null)
        return (this.annFile.header.flags & flag) !== 0
    }

    private hasEventFlag(event: Event, flag: number) {
        return (event.flags & flag) !== 0
    }

    private isSoundPlaying() {
        return this.lastSound?.isPlaying ?? false
    }

    private async showFrame(event: Event, frameIdx: number) {
        this.currentFrame = frameIdx
        await this.changeFrame(event, frameIdx)

        // Animation might get stopped in ONFRAMECHANGED callback like in UFO:S65_ZAMEK
        // If we wouldn't return there then if ONFINISHED has PLAY then it will never stop running
        // because PLAY is changing isPlaying back to true
        if (!this.isPlaying) {
            return
        }

        // Event might be changed in ONFRAMECHANGED
        // event.name might be lowercase
        if (event !== this.currentEvent) {
            return
        }

        // Random sound out of them?
        const eventFrame = event.frames[frameIdx]
        if (eventFrame.sounds.length > 0) {
            const filenames = eventFrame.sounds
            const randomFilename = filenames[Math.floor(Math.random() * filenames.length)]

            if (this.sounds.has(randomFilename)) {
                logger.debug(`Playing sound '${randomFilename}'`, {
                    animo: this,
                })
                const sound = this.sounds.get(randomFilename)!
                this.lastSound = sound.play()
            }
        }
    }

    public syncPosition() {
        assert(this.sprite !== null)
        this.sprite.x =
            this.positionX + this.positionOffsetX - this.anchorOffsetX + this.sprite.width * this.sprite.anchor.x
        this.sprite.y =
            this.positionY + this.positionOffsetY - this.anchorOffsetY + this.sprite.height * this.sprite.anchor.y
    }

    private async changeFrame(event: Event, frameIdx: number, signal = true) {
        assert(this.annFile !== null)
        assert(this.sprite !== null)
        assert(event !== null)

        const eventFrame = event.frames[frameIdx]
        if (eventFrame === undefined) {
            logger.warn(`Attempted to change to non-existent frame ${frameIdx}`, {
                animo: this,
            })
            return
        }

        const imageIndex = event.framesImageMapping[frameIdx]
        const annImage = this.annFile.annImages[imageIndex]

        this.sprite.texture = this.getTexture(imageIndex)
        this.sprite.hitmap = this.getHitmap(imageIndex)
        this.sprite.name = `${this.name} (${event.name}) (ANIMO)` // For PIXI Devtools

        this.positionOffsetX = annImage.positionX + eventFrame.positionX
        this.positionOffsetY = annImage.positionY + eventFrame.positionY
        this.syncPosition()

        this.sprite.width = annImage.width
        this.sprite.height = annImage.height

        if (this.buttonInteractArea !== null) {
            this.buttonInteractArea.hitArea = this.sprite.getBounds()
        }

        if (signal) {
            await this.callbacks.run('ONFRAMECHANGED', event.name)
        }
    }

    private changeImage(imageIndex: number) {
        assert(this.annFile !== null)
        assert(this.sprite !== null)

        const annImage = this.annFile.annImages[imageIndex]
        if (annImage === undefined) {
            logger.warn(`Attempted to change to non-existent frame image ${imageIndex}`, {
                animo: this,
            })
            return
        }

        this.sprite.texture = this.getTexture(imageIndex)
        this.sprite.hitmap = this.getHitmap(imageIndex)

        this.positionOffsetX = annImage.positionX
        this.positionOffsetY = annImage.positionY
        this.syncPosition()

        this.sprite.width = annImage.width
        this.sprite.height = annImage.height

        if (this.buttonInteractArea !== null) {
            this.buttonInteractArea.hitArea = this.sprite.getBounds()
        }
    }

    @method()
    async PLAY(name?: string) {
        if (name === undefined) {
            if (this.currentEvent !== null) {
                await this.playEvent(this.currentEvent.name)
            }
            return
        }

        await this.playEvent(name)
    }

    async playEvent(name: string) {
        if (!this.hasEvent(name.toString())) {
            return
        }

        const event = this.getEvent(name)
        assert(event !== null)
        if (event.framesCount === 0) {
            return
        }

        const noAnimoInterrupt = this.hasAnimoFlag(AnimoFlags.NO_INTERRUPT)
        const noEventInterrupt = this.currentEvent !== null && this.hasEventFlag(this.currentEvent, EventFlags.NO_INTERRUPT)
        if (this.isPlaying && (noAnimoInterrupt || noEventInterrupt)) {
            return
        }

        if (this.currentEvent !== null) {
            this.loopsDone.set(this.currentEvent, 0)
        }
        this.isPaused = false
        this.isPlaying = true

        assert(this.sprite !== null)
        this.sprite.visible = true

        this.currentEvent = event

        // Animation could be paused before next tick, and it wouldn't render new frame
        await this.showFrame(event, 0)
        await this.ONSTARTED()
    }

    private async forceRender() {
        assert(this.currentEvent !== null)
        await this.changeFrame(this.currentEvent, this.currentFrame, true)
    }

    private async ONFINISHED() {
        assert(this.currentEvent !== null)
        const index = this.currentEvent.name.toUpperCase()
        await this.callbacks.run('ONFINISHED', index)
        await this.events?.trigger('ONFINISHED', index)
    }

    private async ONSTARTED() {
        assert(this.currentEvent !== null)
        const index = this.currentEvent.name.toUpperCase()
        await this.callbacks.run('ONSTARTED', index)
        await this.events?.trigger('ONSTARTED', index)
    }

    // For some reason there is sometimes a string passed
    @method()
    async STOP(shouldSignal?: boolean | string) {
        await this.stop(shouldSignal !== false && shouldSignal !== 'FALSE')
    }

    async stop(shouldSignal: boolean) {
        this.isPlaying = false
        this.currentFrame = 0
        this.isPaused = false
        if (shouldSignal) {
            await this.ONFINISHED()
        }
    }

    @method()
    PAUSE() {
        if (this.isPlaying) {
            this.isPlaying = false
            this.isPaused = true
        }
    }

    @method()
    RESUME() {
        if (this.isPaused) {
            this.isPaused = false
            this.isPlaying = true
        }
    }

    @method()
    SETANCHOR(anchor: string) {
        assert(this.sprite !== null)

        switch (anchor) {
            case 'CENTER':
                this.anchorOffsetX = this.positionOffsetX + Math.round(this.sprite.width / 2)
                this.anchorOffsetY = this.positionOffsetY + Math.round(this.sprite.height / 2)
                break
            case 'LEFTUPPER':
                this.anchorOffsetX = this.positionOffsetX
                this.anchorOffsetY = this.positionOffsetY
                break
            case 'LEFTLOWER':
                this.anchorOffsetX = this.positionOffsetX
                this.anchorOffsetY = this.positionOffsetY + this.sprite.height
                break
            case 'RIGHTUPPER':
                this.anchorOffsetX = this.positionOffsetX + this.sprite.width
                this.anchorOffsetY = this.positionOffsetY
                break
            case 'RIGHTLOWER':
                this.anchorOffsetX = this.positionOffsetX + this.sprite.width
                this.anchorOffsetY = this.positionOffsetY + this.sprite.height
                break
            default:
                logger.warn('Invalid anchor specifier - resetting anchor values.', {
                    animo: this,
                })
                this.anchorOffsetX = 0
                this.anchorOffsetY = 0
                break
        }
    }

    @method()
    async SETFRAME(eventNameOrFrameIdx: string | int, frameIdx?: int) {
        if (frameIdx === undefined) {
            const imageIndex = Number(eventNameOrFrameIdx)
            assert(!Number.isNaN(imageIndex))
            this.changeImage(imageIndex)
            return
        }

        const newEvent = eventNameOrFrameIdx.toString()
        const newEventFrame = frameIdx

        const event = this.getEvent(newEvent)
        if (event === null) {
            logger.warn(`SETFRAME: event "${newEvent}" does not exist, ignoring`, {
                animo: this,
            })
            return
        }

        // Necessary in S63_OBOZ
        if (newEventFrame < event.framesCount) {
            this.currentEvent = event
            this.currentFrame = newEventFrame

            // Force render because some animations might not be playing,
            // but they display something (like a keypad screen in S73_0_KOD in UFO)
            await this.forceRender()
        }
    }

    @method()
    SETFPS(fps: int) {
        this.fps = fps
    }

    @method()
    SHOW() {
        assert(this.sprite !== null)
        this.sprite.visible = true
    }

    @method()
    HIDE() {
        assert(this.sprite !== null)
        this.sprite.visible = false
    }

    @method()
    ISVISIBLE(): boolean {
        assert(this.sprite !== null)
        return this.sprite.visible
    }

    @method()
    async MOVE(xOffset: int, yOffset: int) {
        assert(this.sprite !== null)
        await this.move(xOffset, yOffset)
    }

    async move(xOffset: number, yOffset: number) {
        this.positionX += xOffset
        this.positionY += yOffset
        this.syncPosition()
        await this.onMove()
    }

    @method()
    async SETPOSITION(x: int, y: int) {
        assert(this.sprite !== null)

        this.positionX = x
        this.positionY = y
        this.syncPosition()
        await this.onMove()
    }

    @method()
    async SETASBUTTON(enabled: boolean, showPointer: boolean) {
        assert(this.sprite !== null)
        if (enabled) {
            if (this.buttonInteractArea === null) {
                this.buttonInteractArea = new Graphics()
                this.engine.rendering.addToStage(this.buttonInteractArea)
                this.buttonLogic.registerInteractive(this.buttonInteractArea, showPointer)
            }

            this.buttonInteractArea.name = `${this.name} (ANIMO Button)` // For PIXI Devtools
            this.buttonInteractArea.hitArea = this.sprite.getBounds()
            this.buttonInteractArea.zIndex = this.sprite.zIndex

            await this.buttonLogic.enable()
            await this.playEvent('ONNOEVENT')
        } else {
            if (this.buttonInteractArea) {
                this.buttonLogic.unregisterInteractive(this.buttonInteractArea)
                this.engine.rendering.removeFromStage(this.buttonInteractArea)
                this.buttonInteractArea = null
            }
            await this.buttonLogic?.disable()
        }
    }

    @method()
    async DISABLE() {
        await this.buttonLogic.disable() // not sure
    }

    private async onButtonStateChange(prevState: State, event: FSMEvent, newState: State) {
        const playEventIfExists = async (eventName: string) => {
            if (this.hasEvent(eventName)) {
                await this.playEvent(eventName)
            } else if (this.hasEvent('PLAY')) {
                await this.playEvent('PLAY')
            }
        }

        switch (newState) {
            case State.HOVERED:
                await playEventIfExists('ONFOCUSON')
                await this.callbacks.run(event === FSMEvent.UP ? 'ONRELEASE' : 'ONFOCUSON')
                break
            case State.STANDARD:
                if (event === FSMEvent.ENABLE) {
                    await playEventIfExists('ONNOEVENT')
                } else {
                    await playEventIfExists('ONFOCUSOFF')
                    await this.callbacks.run('ONFOCUSOFF')
                }
                break
            case State.PRESSED:
                await playEventIfExists('ONCLICK')
                await this.callbacks.run('ONCLICKED')
                await this.callbacks.run('ONCLICK')
                break
        }
    }

    @method()
    GETCENTERX(): int {
        assert(this.sprite !== null)
        return Math.round(this.sprite.getGlobalPosition().x + this.sprite.width / 2)
    }

    @method()
    GETCENTERY(): int {
        assert(this.sprite !== null)
        return Math.round(this.sprite.getGlobalPosition().y + this.sprite.height / 2)
    }

    @method()
    GETPOSITIONX(): int {
        assert(this.sprite !== null)
        return this.sprite.getGlobalPosition().x
    }

    @method()
    GETPOSITIONY(): int {
        assert(this.sprite !== null)
        return this.sprite.getGlobalPosition().y
    }

    @method()
    GETFRAMENAME(frameID?: string | int, iFrameNo?: int): string | null {
        assert(this.currentEvent !== null)

        if (frameID === undefined && iFrameNo === undefined) {
            return this.currentEvent.frames[this.currentFrame].name
        }

        assert(frameID !== undefined && iFrameNo !== undefined)
        assert(this.annFile !== null)

        const event = typeof frameID === 'string' ? this.getEvent(frameID) : this.annFile.events[frameID]
        assert(event !== null)
        const name = event?.frames[iFrameNo].name
        return name === undefined ? null : name
    }

    @method()
    GETMAXWIDTH(): int {
        assert(this.annFile !== null)
        return Math.max(...this.annFile.annImages.map((e) => e.width))
    }

    @method()
    GETNOFINEVENT(name: string): int {
        return this.getEvent(name)?.framesCount ?? 0
    }

    currentEventName(): string {
        assert(this.currentEvent !== null)
        return this.currentEvent.name.toUpperCase()
    }

    @method()
    GETEVENTNAME(eventIndex?: int): string {
        if (eventIndex === undefined) {
            return this.currentEventName()
        } else {
            const event = this.getAllEvents()[eventIndex]
            assert(event !== undefined)
            return event.name.toUpperCase()
        }
    }

    @method()
    GETFRAME(): int {
        assert(this.currentEvent !== null)
        return this.currentEvent.framesImageMapping[this.currentFrame]
    }

    @method()
    GETCFRAMEINEVENT(): int {
        return this.currentFrame
    }

    @method()
    GETNOF(): int {
        assert(this.annFile !== null)
        return this.annFile.header.framesCount
    }

    @method()
    GETNOE(): int {
        assert(this.annFile !== null)
        return this.annFile.events.length
    }

    @method()
    GETCURRFRAMEPOSX(): int {
        assert(this.currentEvent !== null)
        return this.currentEvent.frames[this.currentFrame].positionX
    }

    @method()
    GETCURRFRAMEPOSY(): int {
        assert(this.currentEvent !== null)
        return this.currentEvent.frames[this.currentFrame].positionY
    }

    @method()
    ISPLAYING(animName?: string): boolean {
        assert(this.currentEvent !== null)
        return this.isPlaying && (animName === undefined || this.currentEvent.name.toUpperCase() === animName)
    }

    // TODO: alternative 5 arg version
    @method()
    ISNEAR(objectName: string, percentage: int): boolean {
        const otherObject = this.getObject(objectName)
        if (otherObject === null || !(otherObject instanceof DisplayType)) {
            return false
        }

        const otherSprite: Sprite | null = otherObject.getRenderObject()
        assert(otherSprite !== null)

        const thisSprite: Sprite | null = this.getRenderObject()
        assert(thisSprite !== null)

        const boundsThis = thisSprite.getBounds()
        const boundsOther = otherSprite.getBounds()

        const x1 = Math.max(boundsThis.x, boundsOther.x)
        const y1 = Math.max(boundsThis.y, boundsOther.y)
        const x2 = Math.min(boundsThis.x + boundsThis.width, boundsOther.x + boundsOther.width)
        const y2 = Math.min(boundsThis.y + boundsThis.height, boundsOther.y + boundsOther.height)

        const intersectionWidth = Math.max(0, x2 - x1)
        const intersectionHeight = Math.max(0, y2 - y1)
        const intersectionArea = intersectionWidth * intersectionHeight

        const areaThis = boundsThis.width * boundsThis.height
        const val = intersectionArea / areaThis
        return val * 100 > percentage
    }

    @method()
    ADDBEHAVIOUR(callbackString: string, behaviourName: string) {
        this.callbacks.addBehaviour(callbackString, behaviourName)
    }

    @method()
    MONITORCOLLISION(newState: boolean) {
        this.collisions.enabled = true
    }

    @method()
    REMOVEMONITORCOLLISION() {
        this.collisions.enabled = false
    }

    @method()
    SETOPACITY(opacity: int) {
        assert(this.sprite !== null)
        this.sprite.alpha = opacity / 255
    }

    @method()
    async LOAD(path: string) {
        this.destroy()
        this.annFile = await this.loadAnimation(path)
        // New maps instead of clear because clones still use the cache
        this.textures = new Map()
        this.hitmaps = new Map()
        await this.initSprite()
    }

    // Only triggered on explicit position change
    // Animation offset change doesn't trigger it
    private async onMove() {
        await this.collisions.handle(async (object: Animo) => {
            await this.callbacks.run('ONCOLLISION', object.name)
        })
    }

    public getEvent(name: string): Event | null {
        assert(this.annFile !== null)
        return this.annFile.events.find((event) => event.name.toUpperCase() === name.toUpperCase()) ?? null
    }

    public hasEvent(name: string): boolean {
        return this.getEvent(name) !== null
    }

    public getAllEvents(): Event[] {
        assert(this.annFile !== null)
        return this.annFile.events
    }

    getRenderObject() {
        return this.sprite
    }

    async clone() {
        const clone = (await super.clone()) as Animo
        clone.isPlaying = this.isPlaying
        clone.currentFrame = this.currentFrame
        clone.isPaused = this.isPaused
        clone.loopsDone = new Map(this.loopsDone)
        clone.playingBackwards = this.playingBackwards
        clone.currentEvent = this.currentEvent
        clone.annFile = this.annFile
        clone.textures = this.textures
        clone.sounds = this.sounds

        clone.fps = this.fps
        clone.positionX = this.positionX
        clone.positionOffsetX = this.positionOffsetX
        clone.positionY = this.positionY
        clone.positionOffsetY = this.positionOffsetY
        clone.anchorOffsetX = this.anchorOffsetX
        clone.anchorOffsetY = this.anchorOffsetY

        await clone.initSprite()
        clone.sprite!.visible = this.sprite!.visible
        clone.setPriority(this.priority)
        return clone
    }

    __getXRayInfo(): XRayInfo | null {
        if (this.buttonInteractArea) {
            return {
                type: 'button',
                bounds: this.buttonInteractArea.hitArea as Rectangle,
                color: this.buttonLogic.enabled ? 0x00ff00 : 0x0000ff,
                position: 'outside',
                visible: this.buttonLogic.state !== State.DISABLED,
            }
        } else if (this.sprite?.visible) {
            return {
                type: 'sprite',
                bounds: this.sprite.getBounds(),
                position: 'inside',
                visible: this.sprite.visible,
            }
        }
        return null
    }
}

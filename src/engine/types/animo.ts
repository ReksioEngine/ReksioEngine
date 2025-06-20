import { DisplayType, Type, XRayInfo } from './index'
import { AnimoDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert, InvalidObjectError } from '../../common/errors'
import * as PIXI from 'pixi.js'
import { Graphics, Rectangle, Sprite, Texture } from 'pixi.js'
import { ANN, Event } from '../../fileFormats/ann'
import { ButtonLogicComponent, Event as FSMEvent, State } from '../components/button'
import { loadSound } from '../../loaders/assetsLoader'
import { FileNotFoundError } from '../../loaders/filesLoader'
import { AdvancedSprite, createHitmapFromImageBytes } from '../rendering'
import { method } from '../../common/types'
import { CollisionsComponent } from '../components/collisions'
import { ISound } from '../sounds'

export class Animo extends DisplayType<AnimoDefinition> {
    private buttonLogic: ButtonLogicComponent
    readonly collisions: CollisionsComponent

    private isPlaying: boolean = false
    private currentFrame: number = 0
    private currentEvent: Event | null = null

    private eventEndedLastTick: Event | null = null
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
    private sounds = new Map<string, ISound>()

    public static Events = {
        ONFINISHED: 'ONFINISHED',
        ONSTARTED: 'ONSTARTED',
    }

    constructor(engine: Engine, parent: Type<any> | null, definition: AnimoDefinition) {
        super(engine, parent, definition)
        this.fps = definition.FPS ?? 16
        this.collisions = new CollisionsComponent(engine, this)
        this.buttonLogic = new ButtonLogicComponent(this.onButtonStateChange.bind(this))
    }

    async init() {
        this.annFile = await this.loadAnimation()
    }

    applyDefaults() {
        const existingObjectWithFilename: Animo | null = this.engine.scopeManager.find(
            (key: string, object) =>
                object != this &&
                object instanceof Animo &&
                object.definition.FILENAME === this.definition.FILENAME &&
                object.sprite != null
        )
        if (existingObjectWithFilename != null) {
            this.sprite = existingObjectWithFilename.sprite
        } else {
            this.initSprite()
        }

        this.currentEvent = this.getEvent(this.getDefaultEvent() ?? '')
        if (this.currentEvent) {
            this.changeFrame(this.currentEvent, 0, false)
        }
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    destroy() {
        if (this.sprite !== null) {
            this.engine.rendering.removeFromStage(this.sprite)
        }
        if (this.buttonInteractArea !== null) {
            this.engine.rendering.removeFromStage(this.buttonInteractArea)
        }
        for (const sound of this.sounds.values()) {
            if (sound.instances != null) {
                sound.destroy()
            }
        }
    }

    tick(elapsedMS: number) {
        this.buttonLogic.tick()
        this.collisions.tick()

        if (!this.isPlaying) {
            return
        }

        this.timeSinceLastFrame += elapsedMS * this.engine.speed

        const frameLength = (1 / this.fps) * 1000
        while (this.isPlaying && this.timeSinceLastFrame >= frameLength) {
            this.tickAnimation()
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

    private async loadAnimation() {
        assert(this.engine.currentScene !== null)

        try {
            const relativePath = this.engine.currentScene.getRelativePath(this.definition.FILENAME)
            const annFile = await this.engine.fileLoader.getANNFile(relativePath)
            await this.loadSfx(annFile)

            console.debug(`File '${this.definition.FILENAME}' loaded successfully!`)
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
            try {
                const sound = await loadSound(this.engine.fileLoader, `Wavs/SFX/${normalizedSFXFilename}`)
                this.sounds.set(filename, sound)
            } catch (err) {
                console.warn(err)
            }
        }

        const soundsNames = new Set<string>()
        for (const event of annFile.events) {
            for (const frame of event.frames) {
                if (frame.sounds) {
                    frame.sounds.forEach((name) => soundsNames.add(name))
                }
            }
        }

        await Promise.all([...soundsNames].map(loadSoundIfNotExists))
    }

    private initSprite() {
        assert(this.annFile !== null)

        this.sprite = new AdvancedSprite()
        this.sprite.name = `${this.name} [ANIMO]` // For PIXI Devtools
        this.sprite.eventMode = 'none'
        this.sprite.visible = this.definition.VISIBLE
        this.SETPRIORITY(this.definition.PRIORITY ?? 0)

        if (this.definition.TOCANVAS) {
            this.engine.rendering.addToStage(this.sprite)
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

    private tickAnimation() {
        assert(this.annFile !== null && this.sprite !== null)

        const event = this.currentEvent
        if (!event) {
            return
        }

        if (this.eventEndedLastTick == this.currentEvent) {
            this.eventEndedLastTick = null
            this.STOP(true)
            return
        }

        this.changeFrame(event, this.currentFrame)

        if (this.currentFrame === 0) {
            this.ONSTARTED()
        }

        // Animation might get stopped in ONFRAMECHANGED callback like in UFO:S65_ZAMEK
        // If we wouldn't return there then if ONFINISHED has PLAY then it will never stop running
        // because PLAY is changing isPlaying back to true
        if (!this.isPlaying) {
            return
        }

        // Event might be changed in ONFRAMECHANGED or ONSTARTED
        // event.name might be lowercase
        if (event !== this.currentEvent) {
            return
        }

        // Random sound out of them?
        const eventFrame = event.frames[this.currentFrame]
        if (eventFrame.sounds) {
            const filenames = eventFrame.sounds
            const randomFilename = filenames[Math.floor(Math.random() * filenames.length)]

            if (this.sounds.has(randomFilename)) {
                console.debug(`Playing sound '${randomFilename}'`)
                const sound = this.sounds.get(randomFilename)!
                const instance = sound.play()
                assert(!(instance instanceof Promise), 'Sound should already be preloaded')
            }
        }

        if (event.loopAfterFrame != 0 && this.currentFrame >= event.loopAfterFrame) {
            this.currentFrame = 0
        } else if (this.currentFrame + 1 >= event.framesCount) {
            this.currentFrame = 0
            this.eventEndedLastTick = this.currentEvent
        } else {
            this.currentFrame++
        }
    }

    public syncPosition() {
        assert(this.sprite !== null)
        this.sprite.x = this.positionX + this.positionOffsetX - this.anchorOffsetX + this.sprite.width * this.sprite.anchor.x
        this.sprite.y = this.positionY + this.positionOffsetY - this.anchorOffsetY + this.sprite.height * this.sprite.anchor.y
    }

    private changeFrame(event: Event, frameIdx: number, signal = true) {
        assert(this.annFile !== null)
        assert(this.sprite !== null)
        assert(event !== null)

        const eventFrame = event.frames[frameIdx]
        if (eventFrame === undefined) {
            console.warn(`Attempted to change to non-existent frame ${frameIdx}`)
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
            this.callbacks.run('ONFRAMECHANGED', event.name)
        }
    }

    private changeImage(imageIndex: number) {
        assert(this.annFile !== null)
        assert(this.sprite !== null)

        const annImage = this.annFile.annImages[imageIndex]
        if (annImage === undefined) {
            console.warn(`Attempted to change to non-existent frame image ${imageIndex}`)
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
    PLAY(name?: string) {
        if (name === undefined) {
            this.SHOW()
            this.RESUME()
            return
        }

        this.playEvent(name)
    }

    playEvent(name: string) {
        if (!this.hasEvent(name.toString())) {
            return
        }

        const event = this.getEvent(name)
        assert(event !== null)
        if (event.framesCount === 0) {
            this.ONFINISHED()
            return
        }

        this.eventEndedLastTick = null
        this.isPlaying = true

        assert(this.sprite !== null)
        this.sprite.visible = true

        this.currentFrame = 0
        this.currentEvent = this.getEvent(name)

        // Animation could be paused before next tick, and it wouldn't render new frame
        // Tick animation so that it's not signaling twice for 0 frame
        // + it has to call ONSTARTED instantly
        this.tickAnimation()
    }

    private forceRender() {
        assert(this.currentEvent !== null)
        this.changeFrame(this.currentEvent, this.currentFrame, true)
    }

    private ONFINISHED() {
        assert(this.currentEvent !== null)
        const index = this.currentEvent.name.toUpperCase()
        this.callbacks.run('ONFINISHED', index)
        this.events?.trigger('ONFINISHED', index)
    }

    private ONSTARTED() {
        assert(this.currentEvent !== null)
        const index = this.currentEvent.name.toUpperCase()
        this.callbacks.run('ONSTARTED', index)
        this.events?.trigger('ONSTARTED', index)
    }

    // For some reason there is sometimes a string passed
    @method()
    STOP(shouldSignal?: boolean | string) {
        this.isPlaying = false
        this.currentFrame = 0
        if (shouldSignal !== false) {
            this.ONFINISHED()
        }
    }

    @method()
    PAUSE() {
        this.isPlaying = false
    }

    @method()
    RESUME() {
        this.isPlaying = true
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
                console.warn('Invalid anchor specifier - resetting anchor values.')
                this.anchorOffsetX = 0
                this.anchorOffsetY = 0
                break
        }
    }

    @method()
    SETFRAME(eventNameOrFrameIdx: string | number, frameIdx?: number) {
        if (frameIdx === undefined) {
            const imageIndex = Number(eventNameOrFrameIdx)
            assert(!Number.isNaN(imageIndex))
            this.changeImage(imageIndex)
            return
        }

        const newEvent = eventNameOrFrameIdx.toString()
        const newEventFrame = Number(frameIdx)

        const event = this.getEvent(newEvent)
        assert(event !== null)

        // Necessary in S63_OBOZ
        if (newEventFrame < event.framesCount) {
            this.currentEvent = event
            this.currentFrame = newEventFrame

            // Force render because some animations might not be playing,
            // but they display something (like a keypad screen in S73_0_KOD in UFO)
            this.forceRender()
        }
    }

    @method()
    SETFPS(fps: number) {
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
    ISVISIBLE() {
        assert(this.sprite !== null)
        return this.sprite.visible
    }

    @method()
    MOVE(xOffset: number, yOffset: number) {
        assert(this.sprite !== null)

        this.positionX += Math.floor(xOffset)
        this.positionY += Math.floor(yOffset)
        this.syncPosition()
        this.onMove()
    }

    @method()
    SETPOSITION(x: number, y: number) {
        assert(this.sprite !== null)

        this.positionX = Math.floor(x)
        this.positionY = Math.floor(y)
        this.syncPosition()
        this.onMove()
    }

    @method()
    SETASBUTTON(enabled: boolean, showPointer: boolean) {
        assert(this.sprite !== null)
        if (enabled) {
            this.buttonInteractArea = new Graphics()
            this.buttonInteractArea.name = `${this.name} (ANIMO Button)` // For PIXI Devtools
            this.buttonInteractArea.hitArea = this.sprite.getBounds()
            this.buttonInteractArea.zIndex = this.sprite.zIndex
            this.engine.rendering.addToStage(this.buttonInteractArea)

            this.buttonLogic.registerInteractive(this.buttonInteractArea, showPointer)
            this.buttonLogic.enable()
            this.playEvent('ONNOEVENT')
        } else {
            if (this.buttonInteractArea) {
                this.buttonLogic.unregisterInteractive(this.buttonInteractArea)
                this.engine.rendering.removeFromStage(this.buttonInteractArea)
                this.buttonInteractArea = null
            }
            this.buttonLogic?.disable()
        }
    }

    private onButtonStateChange(prevState: State, event: FSMEvent, newState: State) {
        const playEventIfExists = (eventName: string) => {
            if (this.hasEvent(eventName)) {
                this.playEvent(eventName)
            } else if (this.hasEvent('PLAY')) {
                this.playEvent('PLAY')
            }
        }

        switch (newState) {
            case State.HOVERED:
                playEventIfExists('ONFOCUSON')
                this.callbacks.run(event === FSMEvent.UP ? 'ONRELEASE' : 'ONFOCUSON')
                break
            case State.STANDARD:
                if (event === FSMEvent.ENABLE) {
                    playEventIfExists('ONNOEVENT')
                } else {
                    playEventIfExists('ONFOCUSOFF')
                    this.callbacks.run('ONFOCUSOFF')
                }
                break
            case State.PRESSED:
                playEventIfExists('ONCLICK')
                this.callbacks.run('ONCLICKED')
                this.callbacks.run('ONCLICK')
                break
        }
    }

    @method()
    GETCENTERX(): number {
        assert(this.sprite !== null)
        return Math.round(this.sprite.getGlobalPosition().x + this.sprite.width / 2)
    }

    @method()
    GETCENTERY(): number {
        assert(this.sprite !== null)
        return Math.round(this.sprite.getGlobalPosition().y + this.sprite.height / 2)
    }

    @method()
    GETPOSITIONX(): number {
        assert(this.sprite !== null)
        return this.sprite.getGlobalPosition().x
    }

    @method()
    GETPOSITIONY(): number {
        assert(this.sprite !== null)
        return this.sprite.getGlobalPosition().y
    }

    @method()
    GETFRAMENAME(): string {
        assert(this.currentEvent !== null)
        return this.currentEvent.frames[this.currentFrame].name
    }

    @method()
    GETMAXWIDTH(): number {
        assert(this.annFile !== null)
        return Math.max(...this.annFile.annImages.map((e) => e.width))
    }

    @method()
    GETNOFINEVENT(): number {
        assert(this.currentEvent !== null)
        return this.currentEvent.framesCount
    }

    @method()
    GETEVENTNAME(): string {
        assert(this.currentEvent !== null)
        return this.currentEvent.name.toUpperCase()
    }

    @method()
    GETFRAME(): number {
        assert(this.currentEvent !== null)
        return this.currentEvent.framesImageMapping[this.currentFrame]
    }

    @method()
    GETCFRAMEINEVENT(): number {
        return this.currentFrame
    }

    @method()
    GETNOF(): number {
        assert(this.annFile !== null)
        return this.annFile.header.framesCount
    }

    @method()
    GETCURRFRAMEPOSX(): number {
        assert(this.currentEvent !== null)
        return this.currentEvent.frames[this.currentFrame].positionX
    }

    @method()
    GETCURRFRAMEPOSY(): number {
        assert(this.currentEvent !== null)
        return this.currentEvent.frames[this.currentFrame].positionY
    }

    @method()
    ISPLAYING(animName?: string) {
        assert(this.currentEvent !== null)
        return this.isPlaying && (animName === undefined || this.currentEvent.name.toUpperCase() == animName)
    }

    @method()
    ISNEAR(objectName: string, percentage: number) {
        const otherObject = this.engine.getObject(objectName)
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

    // Only triggered on explicit position change
    // Animation offset change doesn't trigger it
    private onMove() {
        this.collisions.handle((object: Animo) => {
            this.callbacks.run('ONCOLLISION', object.name)
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

    clone() {
        const clone = super.clone() as Animo
        clone.isPlaying = this.isPlaying
        clone.currentFrame = this.currentFrame
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

        clone.initSprite()
        clone.sprite!.visible = this.sprite!.visible
        if (clone.currentEvent) {
            clone.changeFrame(clone.currentEvent, 0, false)
        }
        return clone
    }

    __getXRayInfo(): XRayInfo | null {
        if (this.buttonInteractArea) {
            return {
                type: 'button',
                bounds: this.buttonInteractArea.hitArea as Rectangle,
                color: this.buttonLogic.enabled ? 0x00ff00 : 0x0000ff,
                position: 'outside',
                visible: this.buttonLogic.state != State.DISABLED,
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

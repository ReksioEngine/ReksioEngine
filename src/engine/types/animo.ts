import { DisplayType, Type, XRayInfo } from './index'
import { AnimoDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert, InvalidObjectError } from '../../common/errors'
import * as PIXI from 'pixi.js'
import { Graphics, Rectangle, Sprite, Texture } from 'pixi.js'
import { ANN, Event } from '../../fileFormats/ann'
import { ButtonLogicComponent, Event as FSMEvent, State } from '../components/button'
import { loadSound } from '../../loaders/assetsLoader'
import { Sound as PIXISound } from '@pixi/sound'
import { FileNotFoundError } from '../../loaders/filesLoader'
import { AdvancedSprite, createHitmapFromImageBytes } from '../rendering'
import { method } from '../../common/types'
import { CollisionsComponent } from '../components/collisions'

export class Animo extends DisplayType<AnimoDefinition> {
    private buttonLogic: ButtonLogicComponent
    readonly collisions: CollisionsComponent

    private isPlaying: boolean = false
    private currentFrame: number = 0
    private currentEvent: string = ''

    private animationEndedLastTick: boolean = false
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
    private sounds = new Map<string, PIXISound>()

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
        this.initSprite()
    }

    applyDefaults() {
        this.currentEvent = this.getDefaultEvent() ?? ''
        const event = this.getEventByName(this.currentEvent)
        if (event) {
            this.changeFrame(event, 0, false)
        }
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    destroy() {
        if (this.sprite !== null) {
            this.engine.removeFromStage(this.sprite)
        }
        if (this.buttonInteractArea !== null) {
            this.engine.removeFromStage(this.buttonInteractArea)
        }
    }

    tick(elapsedMS: number) {
        this.collisions.handle((object: Animo) => {
            this.callbacks.run('ONCOLLISION', object.name)
        })

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
        assert(this.engine.currentScene !== undefined)

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
            this.engine.addToStage(this.sprite)
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

        const event = this.getEventByName(this.currentEvent)
        if (!event) {
            return
        }

        if (this.animationEndedLastTick) {
            this.animationEndedLastTick = false
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
        if (event.name.toUpperCase() !== this.currentEvent.toUpperCase()) {
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
                sound.play()
            }
        }

        if (event.loopAfterFrame != 0 && this.currentFrame >= event.loopAfterFrame) {
            this.currentFrame = 0
        } else if (this.currentFrame + 1 >= event.framesCount) {
            this.currentFrame = 0
            this.animationEndedLastTick = true
        } else {
            this.currentFrame++
        }
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
        this.sprite.x = this.positionX + this.positionOffsetX + this.anchorOffsetX

        this.positionOffsetY = annImage.positionY + eventFrame.positionY
        this.sprite.y = this.positionY + this.positionOffsetY + this.anchorOffsetY

        this.sprite.width = annImage.width
        this.sprite.height = annImage.height

        if (this.buttonInteractArea !== null) {
            this.buttonInteractArea.hitArea = this.sprite.getBounds()
        }

        if (signal) {
            this.callbacks.run('ONFRAMECHANGED', this.currentEvent)
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
        this.sprite.x = this.positionX + this.positionOffsetX + this.anchorOffsetX

        this.positionOffsetY = annImage.positionY
        this.sprite.y = this.positionY + this.positionOffsetY + this.anchorOffsetY

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

        this.isPlaying = true

        assert(this.sprite !== null)
        this.sprite.visible = true

        this.currentFrame = 0
        this.currentEvent = name.toString().toUpperCase()

        // Animation could be paused before next tick, and it wouldn't render new frame
        this.forceRender()
    }

    private forceRender() {
        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)
        this.changeFrame(event, this.currentFrame, false)
    }

    private ONFINISHED() {
        const index = this.currentEvent.toString()
        this.callbacks.run('ONFINISHED', index)
        this.events?.trigger('ONFINISHED', index)
    }

    private ONSTARTED() {
        const index = this.currentEvent.toString()
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
    SETFRAME(eventNameOrFrameIdx: string | number, frameIdx?: number) {
        if (frameIdx === undefined) {
            const imageIndex = Number(eventNameOrFrameIdx)
            assert(!Number.isNaN(imageIndex))
            this.changeImage(imageIndex)
            return
        }

        const newEvent = eventNameOrFrameIdx.toString()
        const newEventFrame = Number(frameIdx)

        const event = this.getEventByName(newEvent)
        assert(event !== null)

        // Necessary in S63_OBOZ
        if (newEventFrame < event.framesCount) {
            this.currentEvent = newEvent
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

        this.positionX += xOffset
        this.positionY += yOffset
        this.sprite.x += xOffset
        this.sprite.y += yOffset
    }

    @method()
    SETPOSITION(x: number, y: number) {
        assert(this.sprite !== null)

        this.positionX = x
        this.positionY = y
        this.sprite.x = x + this.positionOffsetX + this.anchorOffsetX
        this.sprite.y = y + this.positionOffsetY + this.anchorOffsetY
    }

    @method()
    SETASBUTTON(enabled: boolean, showPointer: boolean) {
        assert(this.sprite !== null)
        if (enabled) {
            this.buttonInteractArea = new Graphics()
            this.buttonInteractArea.name = `${this.name} (ANIMO Button)` // For PIXI Devtools
            this.buttonInteractArea.hitArea = this.sprite.getBounds()
            this.buttonInteractArea.zIndex = this.sprite.zIndex
            this.engine.app.stage.addChild(this.buttonInteractArea)

            this.buttonLogic.registerInteractive(this.buttonInteractArea, showPointer)
            this.buttonLogic.enable()
            this.playEvent('ONNOEVENT')
        } else {
            if (this.buttonInteractArea) {
                this.buttonLogic.unregisterInteractive(this.buttonInteractArea)
                this.engine.app.stage.removeChild(this.buttonInteractArea)
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
        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)

        return event.frames[this.currentFrame].name
    }

    @method()
    GETMAXWIDTH(): number {
        assert(this.annFile !== null)
        return Math.max(...this.annFile.annImages.map((e) => e.width))
    }

    @method()
    GETNOFINEVENT(): number {
        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)

        return event.framesCount
    }

    @method()
    GETEVENTNAME(): string {
        return this.currentEvent
    }

    @method()
    GETFRAME(): number {
        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)
        return event.framesImageMapping[this.currentFrame]
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
        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)
        return event.frames[this.currentFrame].positionX
    }

    @method()
    GETCURRFRAMEPOSY(): number {
        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)
        return event.frames[this.currentFrame].positionY
    }

    @method()
    ISPLAYING(animName?: string) {
        if (animName === undefined) {
            return this.isPlaying
        }

        assert(this.currentEvent !== null)
        return this.isPlaying && this.currentEvent == animName
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

    public getEventByName(name: string): Event | null {
        assert(this.annFile !== null)
        return this.annFile.events.find((event) => event.name.toUpperCase() === name.toUpperCase()) ?? null
    }

    public hasEvent(name: string): boolean {
        return this.getEventByName(name) !== null
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
        clone.initSprite()
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

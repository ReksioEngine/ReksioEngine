import {DisplayType} from './index'
import {AnimoDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {assert, InvalidObjectError, NotImplementedError} from '../../errors'
import * as PIXI from 'pixi.js'
import {Rectangle, Texture} from 'pixi.js'
import {ANN, Event} from '../../fileFormats/ann'
import {ButtonLogicComponent, Event as FSMEvent, State} from '../components/button'
import {loadSound} from '../assetsLoader'
import {Sound as PIXISound} from '@pixi/sound'
import {FileNotFoundError} from '../filesLoader'
import {AdvancedSprite, createHitmapFromImageBytes} from '../rendering'
import {method} from '../../types'

export class Animo extends DisplayType<AnimoDefinition> {
    private buttonLogic: ButtonLogicComponent | null = null

    private isPlaying: boolean = false
    private currentFrame: number = 0
    private currentEvent: string = ''
    private currentLoop: number = 0

    private fps: number = 16
    private timeSinceLastFrame: number = 0
    private shouldForceRender: boolean = false

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
        ONSTARTED: 'ONSTARTED'
    }

    constructor(engine: Engine, definition: AnimoDefinition) {
        super(engine, definition)
        this.fps = definition.FPS ?? 16
    }

    async init() {
        this.annFile = await this.loadAnimation()
        this.initSprite()
    }

    ready() {
        if (this.currentEvent === ''){
            assert(this.annFile !== null)
            // Find first event with any frames
            const defaultEvent = this.annFile.events.find(event => event.framesCount > 0)
            if (defaultEvent !== undefined) {
                this.changeFrame(defaultEvent, 0)
                this.currentEvent = defaultEvent.name
            }
        }

        this.callbacks.run('ONINIT')
    }

    destroy() {
        assert(this.sprite !== null)
        this.engine.removeFromStage(this.sprite)
    }

    tick(elapsedMS: number) {
        if (this.shouldForceRender) {
            this.forceRender()
            this.shouldForceRender = false
        }

        if (!this.isPlaying) {
            return
        }

        this.timeSinceLastFrame += elapsedMS * this.engine.speed

        const frameLength = 1 / this.fps * 1000
        while (this.isPlaying && this.timeSinceLastFrame >= frameLength) {
            this.tickAnimation()
            this.timeSinceLastFrame -= frameLength
        }
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
        for (const event of annFile.events) {
            for (const frame of event.frames) {
                if (!frame.sounds) {
                    continue
                }

                for (const filename of frame.sounds) {
                    if (this.sounds.has(filename)) {
                        continue
                    }

                    const normalizedSFXFilename = filename.toLowerCase().replace('sfx\\', '')
                    try {
                        const sound = await loadSound(this.engine.fileLoader, `Wavs/SFX/${normalizedSFXFilename}`)
                        this.sounds.set(filename, sound)
                    } catch (err) {
                        console.warn(err)
                    }
                }
            }
        }
    }

    private initSprite() {
        assert(this.annFile !== null)

        this.sprite = new AdvancedSprite()
        this.sprite.visible = this.definition.VISIBLE
        this.SETPRIORITY(this.definition.PRIORITY ?? 0)

        this.engine.addToStage(this.sprite)
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
            const randomFilename = filenames[Math.floor((Math.random()*filenames.length))]

            if (this.sounds.has(randomFilename)) {
                console.debug(`Playing sound '${randomFilename}'`)
                const sound = this.sounds.get(randomFilename)!
                sound.play()
            }
        }

        if (this.currentFrame + 1 >= event.framesCount) {
            if (this.currentLoop >= event.loopNumber) {
                this.currentLoop = 0
                this.STOP(true)
            } else {
                this.currentLoop++
            }

            this.currentFrame = 0
        } else {
            this.currentFrame++
        }
    }

    private changeFrame(event: Event, frameIdx: number) {
        assert(this.annFile !== null)
        assert(this.sprite !== null)
        assert(event !== null)

        const eventFrame = event.frames[frameIdx]
        const imageIndex = event.framesImageMapping[frameIdx]
        const annImage = this.annFile.annImages[imageIndex]

        // TODO: refactor it so we don't assign texture and hitmap separately?
        this.sprite.texture = this.getTexture(imageIndex)
        this.sprite.hitmap = this.getHitmap(imageIndex)

        this.positionOffsetX = annImage.positionX + eventFrame.positionX
        this.sprite.x = this.positionX + this.positionOffsetX + this.anchorOffsetX

        this.positionOffsetY = annImage.positionY + eventFrame.positionY
        this.sprite.y = this.positionY + this.positionOffsetY + this.anchorOffsetY

        this.sprite.width = annImage.width
        this.sprite.height = annImage.height

        this.callbacks.run('ONFRAMECHANGED', this.currentEvent)
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
        this.shouldForceRender = true
    }

    private forceRender() {
        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)
        this.changeFrame(event, this.currentFrame)
    }

    @method()
    private ONFINISHED() {
        const index = this.currentEvent.toString()
        this.callbacks.run('ONFINISHED', index)
        this.events?.trigger('ONFINISHED', index)
    }

    @method()
    private ONSTARTED() {
        const index = this.currentEvent.toString()
        this.callbacks.run('ONSTARTED', index)
        this.events?.trigger('ONSTARTED', index)
    }

    @method()
    STOP(shouldSignal?: boolean) {
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
            this.currentFrame = Number(eventNameOrFrameIdx)
        } else {
            this.currentEvent = eventNameOrFrameIdx.toString()
            this.currentFrame = Number(frameIdx)
        }

        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)

        // Necessary in S63_OBOZ
        if (this.currentFrame >= event.framesCount) {
            this.currentFrame = 0 // TODO
        }

        // Force render because some animations might not be playing,
        // but they display something (like a keypad screen in S73_0_KOD in UFO)
        this.shouldForceRender = true
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
    SETASBUTTON(arg1: boolean, arg2: boolean) {
        assert(this.sprite !== null)
        if (arg1 && arg2) {
            this.buttonLogic = new ButtonLogicComponent(this.onButtonStateChange.bind(this))
            this.buttonLogic.registerInteractive(this.sprite)
            this.buttonLogic.enable()
            if (this.hasEvent('ONNOEVENT')) {
                this.playEvent('ONNOEVENT')
            }
        } else {
            this.buttonLogic?.unregisterInteractive(this.sprite)
            this.buttonLogic?.disable()
        }
    }

    private onButtonStateChange(prevState: State, event: FSMEvent, newState: State) {
        switch (newState) {
        case State.HOVERED:
            if (this.hasEvent('ONFOCUSON')) {
                this.playEvent('ONFOCUSON')
            } else if (this.hasEvent('PLAY')) {
                this.playEvent('PLAY')
            }

            if (event === FSMEvent.UP) {
                this.callbacks.run('ONRELEASE')
            } else {
                this.callbacks.run('ONFOCUSON')
            }
            break
        case State.STANDARD:
            if (event === FSMEvent.ENABLE) {
                if (this.hasEvent('ONNOEVENT')) {
                    this.playEvent('ONNOEVENT')
                } else if (this.hasEvent('PLAY')) {
                    this.playEvent('PLAY')
                }
            } else {
                if (this.hasEvent('ONFOCUSOFF')) {
                    this.playEvent('ONFOCUSOFF')
                } else if (this.hasEvent('PLAY')) {
                    this.playEvent('PLAY')
                }
                this.callbacks.run('ONFOCUSOFF')
            }
            break
        case State.PRESSED:
            if (this.hasEvent('ONCLICK')) {
                this.playEvent('ONCLICK')
            } else if (this.hasEvent('PLAY')) {
                this.playEvent('PLAY')
            }
            this.callbacks.run('ONCLICKED')
            this.callbacks.run('ONCLICK') // Used in S73_0_KOD in Ufo
            break
        }
    }

    @method()
    GETCENTERX(): number {
        assert(this.sprite !== null)
        return Math.round(this.sprite.getGlobalPosition().x + (this.sprite.width / 2))
    }

    @method()
    GETCENTERY(): number {
        assert(this.sprite !== null)
        return Math.round(this.sprite.getGlobalPosition().y + (this.sprite.height / 2))
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
        return Math.max(...this.annFile.annImages.map(e => e.width))
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
    ISNEAR(objectName: string, distance: number) {
        const otherObject: AdvancedSprite = this.engine.getObject(objectName).getRenderObject()
        const thisObject: AdvancedSprite = this.getRenderObject()!

        const boundOther = new Rectangle(
            otherObject.x - distance,
            otherObject.y - distance,
            otherObject.width + distance * 2,
            otherObject.height + distance * 2
        )

        return boundOther.intersects(thisObject.getBounds())
    }

    @method()
    ADDBEHAVIOUR(callbackString: string, behaviourName: string) {
        this.callbacks.addBehaviour(callbackString, behaviourName)
    }

    @method()
    MONITORCOLLISION(newState: boolean) {
        throw new NotImplementedError()
    }

    @method()
    REMOVEMONITORCOLLISION() {
        throw new NotImplementedError()
    }

    public getEventByName(name: string): Event | null {
        assert(this.annFile !== undefined)
        return this.annFile!.events.find(
            event => event.name.toUpperCase() === name.toUpperCase()
        ) ?? null
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
        clone.currentLoop = this.currentLoop
        clone.annFile = this.annFile
        clone.textures = this.textures
        clone.sounds = this.sounds
        clone.initSprite()
        return clone
    }
}

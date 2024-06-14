import {DisplayType} from './index'
import {AnimoDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../errors'
import {assert, InvalidObjectError} from '../../errors'
import * as PIXI from 'pixi.js'
import {Sprite, Texture} from 'pixi.js'
import {ANN, AnnImage, Event, Frame} from '../../fileFormats/ann'
import {ButtonLogicComponent, Event as FSMEvent, State} from '../components/button'
import {loadSound} from '../assetsLoader'
import {Sound as PIXISound} from '@pixi/sound'
import {FileNotFoundError} from '../../filesLoader'

//TODO: Try to use Image class here
export class Animo extends DisplayType<AnimoDefinition> {
    private buttonLogic: ButtonLogicComponent | null = null

    private isPlaying: boolean = false
    private currentFrameIdx: number = 0
    private currentEvent: string = '1'
    private currentLoop: number = 0
    private usingImageIndex = -1

    private fps: number = 16
    private lastFrameTime: number = 0

    private positionX: number = 0
    private positionOffsetX: number = 0
    private positionY: number = 0
    private positionOffsetY: number = 0

    private annFile: ANN | null = null
    private sprite: Sprite | null = null

    private textures = new Map<number, PIXI.Texture>()
    private sounds = new Map<string, PIXISound>()

    constructor(engine: Engine, definition: AnimoDefinition) {
        super(engine, definition)
        this.fps = definition.FPS ?? 16

        this.callbacks.registerGroup('ONFINISHED', definition.ONFINISHED)
        this.callbacks.registerGroup('ONSTARTED', definition.ONSTARTED)
        this.callbacks.registerGroup('ONFRAMECHANGED', definition.ONFRAMECHANGED)
        this.callbacks.register('ONINIT', definition.ONINIT)

        this.callbacks.register('ONFOCUSON', definition.ONFOCUSON)
        this.callbacks.register('ONFOCUSOFF', definition.ONFOCUSOFF)
        this.callbacks.register('ONCLICK', definition.ONCLICK)
        this.callbacks.register('ONRELEASE', definition.ONRELEASE)
    }

    async init() {
        this.annFile = await this.loadAnimation()
        this.initAnimatedSprite()
    }

    ready() {
        assert(this.annFile !== null)

        const defaultEvent = this.annFile.events.find(event => event.framesCount > 0)
        if (defaultEvent !== undefined) {
            this.renderFrame(defaultEvent, 0)
            this.currentEvent = defaultEvent.name
        }

        this.callbacks.run('ONINIT')
        this.tick(0)
    }

    destroy() {
        assert(this.sprite !== null)
        this.engine.removeFromStage(this.sprite)
    }

    tick(delta: number) {
        assert(this.sprite !== null)
        if (!this.sprite.visible || !this.isPlaying) {
            return
        }

        const currentTime = Date.now()
        if (currentTime - this.lastFrameTime > 1 / this.fps * 1000 * (1 / this.engine.speed)) {
            this.ONTICK()
            this.lastFrameTime = currentTime
        }
    }

    private async loadAnimation() {
        assert(this.engine.currentScene !== undefined)

        const relativePath = this.engine.currentScene.getRelativePath(this.definition.FILENAME)

        try {
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

                const filenames = frame.sounds.split(';').filter(x => x.trim() !== '')
                for (const filename of filenames) {
                    if (!this.sounds.has(filename)) {
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
    }

    private initAnimatedSprite() {
        assert(this.annFile !== null)

        this.sprite = new PIXI.Sprite()
        this.sprite.visible = this.definition.VISIBLE
        this.SETPRIORITY(this.definition.PRIORITY)

        this.engine.addToStage(this.sprite)
    }

    getTextureFrom(imageIndex: number): Texture {
        if (this.textures.has(imageIndex)) {
            return this.textures.get(imageIndex)!
        }

        if (this.annFile == null) {
            throw new Error('Animation is not loaded yet!')
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

    ONTICK() {
        assert(this.annFile !== null && this.sprite !== null)
        const event = this.getEventByName(this.currentEvent)
        if (event) {
            this.tickAnimation(event)
        }
    }

    private tickAnimation(event: Event) {
        assert(this.annFile !== null && this.sprite !== null)
        this.renderFrame(event, this.currentFrameIdx)

        if (this.currentFrameIdx === 0) {
            this.ONSTARTED()
        }

        // Random sound out of them?
        const eventFrame = event.frames[this.currentFrameIdx]
        if (eventFrame.sounds) {
            const filenames = eventFrame.sounds.split(';')
            const randomFilename = filenames[Math.floor((Math.random()*filenames.length))]
            const sound = this.sounds.get(randomFilename)
            if (sound !== undefined) {
                console.debug(`Playing sound '${randomFilename}'`)
                sound.play()
            }
        }

        this.currentFrameIdx += 1
        this.invokeIfAnimationCompleted(event)
        this.ONFRAMECHANGED()
    }

    private updateSprite(eventFrame: Frame, imageIndex: number, annImage: AnnImage) {
        //TODO: Sometimes this.sprite.transform === null
        if (this.sprite === null) return

        if (imageIndex != this.usingImageIndex) {
            this.usingImageIndex = imageIndex
            this.sprite.texture = this.getTextureFrom(imageIndex)
        }

        this.positionOffsetX = annImage.positionX + eventFrame.positionX
        this.sprite.x = this.positionX + this.positionOffsetX

        this.positionOffsetY = annImage.positionY + eventFrame.positionY
        this.sprite.y = this.positionY + this.positionOffsetY

        this.sprite.width = annImage.width
        this.sprite.height = annImage.height
    }

    private invokeIfAnimationCompleted(event: Event) {
        if (this.currentFrameIdx < event.framesCount) return

        if (this.currentLoop >= event.loopNumber) {
            this.STOP(false)
            this.ONFINISHED()
        }

        this.currentLoop += 1
        this.currentFrameIdx = 0
    }

    private ONFINISHED() {
        const index = this.currentEvent.toString()
        this.callbacks.run('ONFINISHED', index.toString())
    }

    private ONSTARTED() {
        const index = this.currentEvent.toString()
        this.callbacks.run('ONSTARTED', index.toString())
    }

    private ONFRAMECHANGED() {
        this.callbacks.run('ONFRAMECHANGED', this.currentEvent)
    }

    PLAY(name: string | number) {
        if (!this.getEventByName(name.toString())) {
            return false
        }

        this.isPlaying = true
        this.currentFrameIdx = 0
        this.currentEvent = name.toString().toUpperCase()

        this.SHOW() //I noticed that play method should call show method
        return true
    }

    STOP(arg: boolean) {
        this.isPlaying = false
        this.currentFrameIdx = 0
    }

    PAUSE() {
        this.isPlaying = false
    }

    RESUME() {
        this.isPlaying = true
    }

    SETFRAME(eventName: string, frameIdx: number) {
        this.currentEvent = eventName
        this.currentFrameIdx = frameIdx

        // Don't wait for a tick because some animations might not be playing,
        // but they display something (like a keypad screen in S73_0_KOD in UFO)
        const event = this.getEventByName(eventName)
        assert(this.annFile !== null)
        assert(event !== null)

        this.renderFrame(event, frameIdx)
    }

    SETFPS(fps: number) {
        this.fps = fps
    }

    SHOW() {
        assert(this.sprite !== null)
        this.sprite.visible = true
    }

    HIDE() {
        assert(this.sprite !== null)
        this.sprite.visible = false
    }

    MOVE(xOffset: number, yOffset: number) {
        assert(this.sprite !== null)

        this.positionX += xOffset
        this.positionY += yOffset
        this.sprite.x += xOffset
        this.sprite.y += yOffset
    }

    SETPOSITION(x: number, y: number) {
        assert(this.sprite !== null)

        this.positionX = x
        this.positionY = y
        this.sprite.x = x + this.positionOffsetX
        this.sprite.y = y + this.positionOffsetY
    }

    SETASBUTTON(arg1: boolean, arg2: boolean) {
        assert(this.sprite !== null)

        if (arg1 && arg2) {
            this.buttonLogic = new ButtonLogicComponent(this.onButtonStateChange.bind(this))
            this.buttonLogic.registerInteractive(this.sprite)
            this.buttonLogic.enable()
            this.PLAY('ONNOEVENT')
        } else {
            this.buttonLogic?.unregisterInteractive(this.sprite)
            this.buttonLogic?.disable()
        }
    }

    onButtonStateChange(prevState: State, event: FSMEvent, newState: State) {
        switch (newState) {
        case State.HOVERED:
            this.PLAY('ONFOCUSON') || this.PLAY('PLAY')
            if (event === FSMEvent.UP) {
                this.callbacks.run('ONRELEASE')
            } else {
                this.callbacks.run('ONFOCUSON')
            }
            break
        case State.STANDARD:
            if (event === FSMEvent.ENABLE) {
                this.PLAY('ONNOEVENT') || this.PLAY('PLAY')
            } else {
                this.PLAY('ONFOCUSOFF') || this.PLAY('PLAY')
                this.callbacks.run('ONFOCUSOFF')
            }
            break
        case State.PRESSED:
            this.PLAY('ONCLICK') || this.PLAY('PLAY')
            this.callbacks.run('ONCLICKED')
            this.callbacks.run('ONCLICK') // Used in S73_0_KOD in Ufo
            break
        }
    }

    GETCENTERX(): number {
        assert(this.sprite !== null && this.getGlobalPosition() !== null)
        return this.getGlobalPosition()!.x + (this.sprite.width / 2)
    }

    GETCENTERY(): number {
        assert(this.sprite !== null && this.getGlobalPosition() !== null)
        return this.getGlobalPosition()!.y + (this.sprite.height / 2)
    }

    GETPOSITIONX(): number {
        assert(this.sprite !== null && this.getGlobalPosition() !== null)
        return this.getGlobalPosition()!.x
    }

    GETPOSITIONY(): number {
        assert(this.sprite !== null && this.getGlobalPosition() !== null)
        return this.getGlobalPosition()!.y
    }

    GETFRAMENAME(): string {
        const event = this.getEventByName(this.currentEvent)
        assert(event !== null)

        return event.frames[this.currentFrameIdx].name
    }

    GETMAXWIDTH(): number {
        throw new NotImplementedError()
    }

    GETNOFINEVENT(): string {
        throw new NotImplementedError()
    }

    GETEVENTNAME(): string {
        return this.currentEvent
    }

    GETFRAME(): number {
        return this.currentFrameIdx
    }

    GETCURRFRAMEPOSX(): number {
        throw new NotImplementedError()
    }

    GETCURRFRAMEPOSY(): number {
        throw new NotImplementedError()
    }

    ISPLAYING(animName?: string) {
        if (animName === undefined) {
            return this.isPlaying
        }

        return this.isPlaying && this.currentEvent == animName
    }

    ISNEAR(objectName: string, arg: number) {
        const otherObject = this.engine.getObject(objectName)
        const thisObject = this.getRenderObject()!

        const thisX = thisObject.x + thisObject.width/2
        const thisY = thisObject.y + thisObject.height/2

        const otherX = otherObject.x + otherObject.width/2
        const otherY = otherObject.y + otherObject.height/2

        // TODO, I don't think that its like in the game
        return Math.hypot(otherX-thisX, otherY-thisY) < arg
    }

    ADDBEHAVIOUR(callbackString: string, behaviourName: string) {
        this.callbacks.addBehaviour(callbackString, behaviourName)
    }

    getEventByName(name: string): Event | null {
        assert(this.annFile !== undefined)
        return this.annFile!.events.find(
            event => event.name.toUpperCase() === name.toUpperCase()
        ) ?? null
    }

    renderFrame(event: Event, frameIdx: number) {
        assert(this.annFile !== null)
        assert(event !== null)

        const eventFrame = event.frames[frameIdx]
        const imageIndex = event.framesImageMapping[frameIdx]
        const annImage = this.annFile.annImages[imageIndex]
        this.updateSprite(eventFrame, imageIndex, annImage)
    }

    getRenderObject() {
        return this.sprite
    }

    clone() {
        const clone = super.clone() as Animo
        clone.isPlaying = this.isPlaying
        clone.currentFrameIdx = this.currentFrameIdx
        clone.currentEvent = this.currentEvent
        clone.currentLoop = this.currentLoop
        clone.usingImageIndex = this.usingImageIndex
        clone.annFile = this.annFile
        clone.textures = this.textures
        clone.sounds = this.sounds
        clone.initAnimatedSprite()
        return clone
    }

    debuggerValues() {
        return {
            ...super.debuggerValues(),
            isPlaying: this.isPlaying,
            currentFrameIdx: this.currentFrameIdx,
            currentEvent: this.currentEvent,
            currentLoop: this.currentLoop,
            usingImageIndex: this.usingImageIndex,
            fps: this.fps,
            lastFrameTime: this.lastFrameTime,
            positionX: this.positionX,
            positionY: this.positionY
        }
    }
}

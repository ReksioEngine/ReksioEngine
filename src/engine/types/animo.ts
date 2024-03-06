import {Type} from './index'
import {AnimoDefinition, callbacks} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'
import * as PIXI from 'pixi.js'
import {Sprite, Texture} from 'pixi.js'
import {FileNotFoundError} from '../../filesLoader'
import {ANN} from '../../fileFormats/ann'

export class Animo extends Type<AnimoDefinition> {
    private visible: boolean
    private isPlay: boolean = false
    private currentFrame: number = 0
    private currentAnimation: string = '1'
    private currentLoop: number = 0
    private usingImageIndex = 0

    //private animatedSprite: AnimatedSprite | null = null
    private rawAnn: ANN | null = null
    private sprite: Sprite | null = null

    private readonly onFinished: callbacks<string>

    constructor(engine: Engine, definition: AnimoDefinition) {
        super(engine, definition)

        this.visible = this.definition.VISIBLE
        this.onFinished = definition.ONFINISHED
    }

    async init() {
        this.rawAnn = await this.loadAnimation()

        //TODO: Use Image class maybe (to check)

        this.initAnimatedSprite()

        if (this.definition.ONINIT) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }
    }

    destroy() {
        if (this.sprite === null) return

        this.sprite.destroy()
    }

    tick(delta: number) {
        if (!this.visible || !this.isPlay) return

        this.ONTICK()
    }

    private async loadAnimation() {
        const relativePath = this.engine.currentScene?.getRelativePath(this.definition.FILENAME)
        if (relativePath == undefined)
            throw new FileNotFoundError('Current scene is undefined!')

        return await this.engine.fileLoader.getANNFile(relativePath)
    }

    private initAnimatedSprite() {
        if (this.rawAnn === null) return

        this.sprite = new PIXI.Sprite(this.getTextureFrom(0))
        this.sprite.visible = this.definition.VISIBLE
        this.SETPRIORITY(this.definition.PRIORITY)

        this.engine.addToStage(this.sprite)

        console.debug(`File ${this.definition.FILENAME} loaded successfully!`)
    }

    getTextureFrom(imageIndex: number): Texture {
        if (this.rawAnn == null)
            throw new Error('RawAnn is null')

        const baseTexture = PIXI.BaseTexture.fromBuffer(
            new Uint8Array(this.rawAnn.images[imageIndex]),
            this.rawAnn.annImages[imageIndex].width,
            this.rawAnn.annImages[imageIndex].height
        )

        return new PIXI.Texture(baseTexture)
    }

    ONTICK() {
        if (this.rawAnn === null || this.sprite === null) return

        const key = this.currentAnimation

        const event = this.rawAnn.events[key]
        const eventFrame = event.frames[this.currentFrame]
        const imageIndex= event.framesImageMapping[this.currentFrame]
        const annImage = this.rawAnn.annImages[imageIndex]

        if (imageIndex != this.usingImageIndex) {
            this.usingImageIndex = imageIndex
            this.sprite.texture = this.getTextureFrom(imageIndex)
        }

        this.sprite.x = annImage.positionX + eventFrame.positionX
        this.sprite.y = annImage.positionY + eventFrame.positionY

        this.sprite.width = annImage.width
        this.sprite.height = annImage.height

        this.currentFrame = (this.currentFrame + 1) % event.framesCount

        if (this.currentFrame == 0) {
            if (this.currentLoop >= event.loopNumber) {
                this.STOP(false)

                this.InvokeOnFinish(this.currentAnimation.toString())
            }

            this.currentLoop += 1
        }
    }

    private InvokeOnFinish(index: string) {
        if (this.onFinished && this.onFinished.parametrized.has(index.toString()))
            this.engine.executeCallback(this, this.onFinished.parametrized.get(index.toString())!)
    }

    PLAY(name: string) {
        this.isPlay = true
        this.currentFrame = 0
        this.currentAnimation = name
    }

    STOP(arg: boolean) {
        this.isPlay = false
        this.currentFrame = 0
    }

    PAUSE() {
        this.isPlay = false
    }

    RESUME() {
        this.isPlay = true
    }

    SETFRAME(frame: number) {
        this.currentFrame = frame
    }

    SETFPS(fps: number) {
        throw new NotImplementedError()
    }

    SHOW() {
        if (this.sprite === null) return
        this.sprite.visible = true
    }

    HIDE() {
        if (this.sprite === null) return
        this.sprite.visible = false
    }

    MOVE(xOffset: number, yOffset: number) {
        if (this.sprite === null) return

        this.sprite.x += xOffset
        this.sprite.y += yOffset
    }

    SETPOSITION(x: number, y: number) {
        if (this.sprite === null) return

        this.sprite.x = x
        this.sprite.y = y
    }

    SETPRIORITY(priority: number) {
        if (this.sprite === null) return

        this.sprite.zIndex = 1000 + -priority
        this.sprite.sortChildren()
    }

    SETASBUTTON(arg1: boolean, arg2: boolean) {
        throw new NotImplementedError()
    }

    GETCENTERX(): number {
        throw new NotImplementedError()
    }

    GETCENTERY(): number {
        throw new NotImplementedError()
    }

    GETPOSITIONY(): number {
        throw new NotImplementedError()
    }

    GETPOSITIONX(): number {
        throw new NotImplementedError()
    }

    GETFRAMENAME(): string {
        throw new NotImplementedError()
    }

    GETMAXWIDTH(): number {
        throw new NotImplementedError()
    }

    GETNOFINEVENT(): string {
        throw new NotImplementedError()
    }

    GETEVENTNAME(): string {
        throw new NotImplementedError()
    }

    GETFRAME(): number {
        throw new NotImplementedError()
    }

    GETCURRFRAMEPOSX(): number {
        throw new NotImplementedError()
    }

    GETCURRFRAMEPOSY(): number {
        throw new NotImplementedError()
    }

    CLONE(arg: number) {
        throw new NotImplementedError()
    }

    ISPLAYING(animName: string) {
        throw new NotImplementedError()
    }

    ISNEAR(objectName: string, arg: number) {
        throw new NotImplementedError()
    }
}

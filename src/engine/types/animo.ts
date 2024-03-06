import {Type} from './index'
import {AnimoDefinition, callbacks} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'
import {AnimatedSprite, Sprite} from 'pixi.js'
import {FileNotFoundError} from '../../filesLoader'
import {ANN} from '../../fileFormats/ann'
import * as PIXI from 'pixi.js'

export class Animo extends Type<AnimoDefinition> {
    private priority: number
    private visible: boolean
    private isPlay: boolean = false
    private currentFrame: number = 0
    private currentAnimation: string = '1'
    private currentLoop: number = 0

    //private animatedSprite: AnimatedSprite | null = null
    private rawAnn: ANN | null = null
    private sprite: Sprite | null = null

    private readonly onFinished: callbacks<string>

    constructor(engine: Engine, definition: AnimoDefinition) {
        super(engine, definition)
        this.priority = this.definition.PRIORITY
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

        this.SETPRIORITY(this.definition.PRIORITY)
        //this.animatedSprite.visible = this.definition.VISIBLE

        this.sprite = new PIXI.Sprite(this.GetTextureFrom(0))
        this.engine.addToStage(this.sprite)

        console.debug(`File ${this.definition.FILENAME} loaded successfully!`)
    }

    GetTextureFrom(imageIndex: number) {
        if (this.rawAnn == null) return

        const ufoBaseTexture = PIXI.BaseTexture.fromBuffer(
            new Uint8Array(this.rawAnn.images[imageIndex]),
            this.rawAnn.annImages[imageIndex].width,
            this.rawAnn.annImages[imageIndex].height
        )

        const ufoTexture = new PIXI.Texture(ufoBaseTexture)
        return ufoTexture
    }

    ONTICK() {
        if (this.rawAnn === null || this.sprite === null) return

        const key = this.currentAnimation

        const event = this.rawAnn.events[key]
        const eventFrame = event.frames[this.currentFrame]
        const imageIndex= event.framesImageMapping[this.currentFrame]

        //this.sprite = new PIXI.Sprite(this.GetTextureFrom(imageIndex))
        this.sprite.x = this.rawAnn.annImages[imageIndex].positionX + eventFrame.positionX
        this.sprite.y = this.rawAnn.annImages[imageIndex].positionY + eventFrame.positionY

        this.currentFrame = (this.currentFrame + 1) % event.framesCount

        if (this.currentFrame == 0) {
            if (this.currentLoop >= event.loopNumber) {
                this.InvokeOnFinish(this.currentAnimation.toString())

                this.STOP(false)
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
        this.visible = true
    }
    HIDE() {
        this.visible = false
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
        this.priority = priority
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

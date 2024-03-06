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

        const ufoBaseTexture = PIXI.BaseTexture.fromBuffer(
            new Uint8Array(this.rawAnn.images[0]),
            this.rawAnn.annImages[0].width,
            this.rawAnn.annImages[0].height
        )

        const ufoTexture = new PIXI.Texture(ufoBaseTexture)
        this.sprite = new PIXI.Sprite(ufoTexture)
        this.engine.addToStage(this.sprite)

        console.debug(`File ${this.definition.FILENAME} loaded successfully!`)
    }

    ONTICK() {
        if (this.rawAnn === null || this.sprite === null) return

        const eventFrame = this.rawAnn.events[0].frames[this.currentFrame]
        this.sprite.x = this.rawAnn.annImages[0].positionX + eventFrame.positionX
        this.sprite.y = this.rawAnn.annImages[0].positionY + eventFrame.positionY
        this.currentFrame = (this.currentFrame + 1) % this.rawAnn.events[0].frames.length

        const index = Math.floor(Math.random() * 5)

        if (this.onFinished && this.onFinished.parametrized.has(index.toString())){
            this.engine.executeCallback(this, this.onFinished.parametrized.get(index.toString())!)
        }
    }

    PLAY(name: string) {
        this.isPlay = true
        this.currentFrame = 0
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
        throw new NotImplementedError()
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

    SETPOSITION(x: number, y: number) {
        throw new NotImplementedError()
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

    MOVE(offsetX: number, offsetY: number) {
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
import {Type} from './index'
import {AnimoDefinition, callbacks} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'
import {AnimatedSprite} from 'pixi.js'
import {FileNotFoundError} from '../../filesLoader'

export class Animo extends Type<AnimoDefinition> {
    private priority: number
    private visible: boolean

    private animatedSprite: AnimatedSprite | null = null

    private readonly onFinished: callbacks<string>

    constructor(engine: Engine, definition: AnimoDefinition) {
        super(engine, definition)
        this.priority = this.definition.PRIORITY
        this.visible = this.definition.VISIBLE

        this.onFinished = definition.ONFINISHED
    }

    async init() {
        const animation = await this.loadAnimation()

        //this.initAnimatedSprite(animation);

        if (this.definition.ONINIT) {
            this.engine.executeCallback(this, this.definition.ONINIT)
        }
    }

    destroy() {
        if (this.animatedSprite != null)
            this.animatedSprite.destroy()
    }

    ready() {
    }

    tick(delta: number) {
        if (!this.visible) {
            return
        }

        this.ONTICK()
    }

    private async loadAnimation() {
        const relativePath = this.engine.currentScene?.getRelativePath(this.definition.FILENAME)
        if (relativePath == undefined)
            throw new FileNotFoundError('Current scene is undefined!')

        return await this.engine.fileLoader.getANNFile(relativePath)
    }

    private initAnimatedSprite() {


        this.SETPRIORITY(this.definition.PRIORITY)
        //this.animatedSprite.visible = this.definition.VISIBLE
        //this.engine.addToStage(this.animatedSprite)

        console.debug(`File ${this.definition.FILENAME} loaded successfully!`)
    }

    ONTICK() {
        const index = Math.floor(Math.random() * 5)

        if (this.onFinished && this.onFinished.parametrized.has(index.toString())){
            this.engine.executeCallback(this, this.onFinished.parametrized.get(index.toString())!)
        }
    }

    PLAY(name: string) {
        throw new NotImplementedError()
    }
    SETFRAME(frame: number) {
        throw new NotImplementedError()
    }
    SETFPS(fps: number) {
        throw new NotImplementedError()
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
    SHOW() {
        this.visible = true
    }
    HIDE() {
        this.visible = false
    }
    STOP(arg: boolean) {
        throw new NotImplementedError()
    }
    PAUSE() {
        throw new NotImplementedError()
    }
    RESUME() {
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
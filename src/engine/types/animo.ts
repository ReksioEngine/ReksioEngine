import {Type} from './index'
import {AnimoDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'
import {AnimatedSprite, Sprite} from "pixi.js";
import {FileNotFoundError, getANNFile} from "../../filesLoader";
import {loadSprite} from "../assetsLoader";
import {loadAnn} from "../../fileFormats/ann";

export class Animo extends Type<AnimoDefinition> {
    private priority: number
    private visible: boolean

    private animatedSprite: AnimatedSprite | null = null

    constructor(engine: Engine, definition: AnimoDefinition) {
        super(engine, definition)
        this.priority = this.definition.PRIORITY
        this.visible = this.definition.VISIBLE
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

    private async loadAnimation() {
        const relativePath = this.engine.currentScene?.getRelativePath(this.definition.FILENAME);
        if (relativePath == undefined)
            throw new FileNotFoundError("Current scene is undefined!")

        return await getANNFile(relativePath)
    }

    private initAnimatedSprite() {


        this.SETPRIORITY(this.definition.PRIORITY)
        //this.animatedSprite.visible = this.definition.VISIBLE
        //this.engine.addToStage(this.animatedSprite)

        console.debug(`File ${this.definition.FILENAME} loaded successfully!`)
    }

    PLAY(name: string) {
        //throw new NotImplementedError()
    }
    SETFRAME(frame: number) {
        //throw new NotImplementedError()
    }
    SETFPS(fps: number) {
        //throw new NotImplementedError()
    }
    SETPOSITION(x: number, y: number) {
        //throw new NotImplementedError()
    }
    SETPRIORITY(priority: number) {
        this.priority = priority
    }
    SETASBUTTON(arg1: boolean, arg2: boolean) {
        //throw new NotImplementedError()
    }
    GETCENTERX(): number {
        //throw new NotImplementedError()
        return 0
    }
    GETCENTERY(): number {
        //throw new NotImplementedError()
        return 0
    }
    GETPOSITIONY(): number {
        //throw new NotImplementedError()
        return 0
    }
    GETPOSITIONX(): number {
        //throw new NotImplementedError()
        return 0
    }
    GETFRAMENAME(): string {
        //throw new NotImplementedError()
        return ""
    }
    GETMAXWIDTH(): number {
        //throw new NotImplementedError()
        return 0
    }
    GETNOFINEVENT(): string {
        //throw new NotImplementedError()
        return ""
    }
    GETEVENTNAME(): string {
        //throw new NotImplementedError()

        return ""
    }
    GETFRAME(): number {
        //throw new NotImplementedError()
        return 0
    }
    GETCURRFRAMEPOSX(): number {
        //throw new NotImplementedError()

        return 0
    }
    GETCURRFRAMEPOSY(): number {
        //throw new NotImplementedError()

        return 0
    }
    SHOW() {
        //this.visible = true
    }
    HIDE() {
        //this.visible = false
    }
    STOP(arg: boolean) {
        //throw new NotImplementedError()
    }
    PAUSE() {
        //throw new NotImplementedError()
    }
    RESUME() {
        //throw new NotImplementedError()
    }
    MOVE(offsetX: number, offsetY: number) {
        //throw new NotImplementedError()
    }
    CLONE(arg: number) {
        //throw new NotImplementedError()
    }
    ISPLAYING(animName: string) {
        //throw new NotImplementedError()
    }
    ISNEAR(objectName: string, arg: number) {
        //throw new NotImplementedError()
    }
}
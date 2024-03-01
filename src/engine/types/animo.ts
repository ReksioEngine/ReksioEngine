import {Type} from './index'
import {AnimoDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../utils'

export class Animo extends Type<AnimoDefinition> {
    private priority: number
    private visible: boolean

    constructor(engine: Engine, definition: AnimoDefinition) {
        super(engine, definition)
        this.priority = this.definition.PRIORITY
        this.visible = this.definition.VISIBLE
    }

    init() {
        if (this.definition.ONINIT) {
            // this.engine.executeCallback(this, this.definition.ONINIT)
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
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
            this.engine.executeCallback(this, this.definition.ONINIT)
        }
    }

    PLAY(name: string) {
        throw NotImplementedError
    }
    SETFRAME(frame: number) {
        throw NotImplementedError
    }
    SETFPS(fps: number) {
        throw NotImplementedError
    }
    SETPOSITION(x: number, y: number) {
        throw NotImplementedError
    }
    SETPRIORITY(priority: number) {
        this.priority = priority
    }
    SETASBUTTON(arg1: boolean, arg2: boolean) {
        throw NotImplementedError
    }
    GETCENTERX(): number {
        throw NotImplementedError
    }
    GETCENTERY(): number {
        throw NotImplementedError
    }
    GETPOSITIONY(): number {
        throw NotImplementedError
    }
    GETPOSITIONX(): number {
        throw NotImplementedError
    }
    GETFRAMENAME(): string {
        throw NotImplementedError
    }
    GETMAXWIDTH(): number {
        throw NotImplementedError
    }
    GETNOFINEVENT(): string {
        throw NotImplementedError
    }
    GETEVENTNAME(): string {
        throw NotImplementedError
    }
    GETFRAME(): number {
        throw NotImplementedError
    }
    GETCURRFRAMEPOSX(): number {
        throw NotImplementedError
    }
    GETCURRFRAMEPOSY(): number {
        throw NotImplementedError
    }
    SHOW() {
        this.visible = true
    }
    HIDE() {
        this.visible = false
    }
    STOP(arg: boolean) {
        throw NotImplementedError
    }
    PAUSE() {
        throw NotImplementedError
    }
    RESUME() {
        throw NotImplementedError
    }
    MOVE(offsetX: number, offsetY: number) {
        throw NotImplementedError
    }
    CLONE(arg: number) {
        throw NotImplementedError
    }
    ISPLAYING(animName: string) {
        throw NotImplementedError
    }
    ISNEAR(objectName: string, arg: number) {
        throw NotImplementedError
    }
}
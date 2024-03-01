import {Type} from './index'
import {Engine} from '../index'
import {ImageDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'
import {Sprite} from "pixi.js";
import {loadSprite} from "../assetsLoader";

export class Image extends Type<ImageDefinition> {
    private opacity: number = 1
    private priority: number

    private sprite: Sprite | null = null

    private x: number = 0
    private y: number = 0

    constructor(engine: Engine, definition: ImageDefinition) {
        super(engine, definition)
        this.priority = definition.PRIORITY
    }

    async init() {
        this.sprite = await this.load()
    }

    destroy() {
        this.sprite?.destroy()
    }

    ready() {
        this.initSprite();
    }

    private async load() {
        console.debug(`Loading file: ${this.definition.FILENAME}`)

        //TODO: How to get total path to file? From scene structure?
        const temporary_path = `DANE/ReksioUfo/PRZYGODA/s1_0_intro1/${this.definition.FILENAME}`

        return await loadSprite(temporary_path);
    }

    private initSprite() {
        if (this.sprite == null)
            throw new Error(`Cannot load image '${this.definition.FILENAME}'`);

        this.SETPOSITION(0, 0)
        this.SETPRIORITY(this.definition.PRIORITY)
        this.sprite.visible = true //this.definition.VISIBLE returning false?
        this.engine.app.stage.addChild(this.sprite)

        console.debug(`File ${this.definition.FILENAME} loaded successfully! ${this.definition.VISIBLE}`)
    }

    SETOPACITY(opacity: number) {
        this.opacity = opacity
    }

    MOVE(xOffset: number, yOffset: number) {
        this.x += xOffset
        this.y += yOffset
    }

    SETPOSITION(x: number, y: number) {
        this.x = x
        this.y = y
    }

    SETPRIORITY(priority: number) {
        this.priority = priority
    }

    CLONE() {
        throw new NotImplementedError()
    }

    SHOW() {
        if (this.sprite == null)
            return;

        this.sprite.visible = true
    }

    HIDE() {
        if (this.sprite == null)
            return;

        this.sprite.visible = false
    }

    GETPOSITIONY() {
        return this.y
    }

    GETALPHA(x: number, y: number) {
        throw new NotImplementedError()
    }
}

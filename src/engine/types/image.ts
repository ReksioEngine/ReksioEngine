import {Type} from './index'
import {Engine} from '../index'
import {ImageDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'
import {getIMGFile} from "../../filesLoader";
import * as PIXI from "pixi.js";
import {Sprite} from "pixi.js";
import {loadSound} from "../assetsLoader";
import {RecognitionException} from "antlr4";

export class Image extends Type<ImageDefinition> {
    private visible: boolean
    private opacity: number = 1
    private priority: number

    private sprite: Sprite | null = null

    private x: number = 0
    private y: number = 0

    constructor(engine: Engine, definition: ImageDefinition) {
        super(engine, definition)
        this.visible = definition.VISIBLE
        this.priority = definition.PRIORITY
    }

    async init() {
        this.sprite = await this.Load()

        this.InitSprite();
    }

    destroy() {
        this.sprite?.destroy()
    }

    ready() {
        if (this.sprite == null)
            throw new Error(`Cannot load image '${this.definition.FILENAME}'`);

        const app = this.engine.app
        app.stage.addChild(this.sprite);
    }

    private async Load() { //'DANE/ReksioUfo/PRZYGODA/s1_0_intro1/gwiazdy.img'
        console.log(`Loading file: ${this.definition.FILENAME}`)

        const image = await getIMGFile(this.definition.FILENAME)
        const baseTexture = PIXI.BaseTexture.fromBuffer(
            new Uint8Array(image.bytes),
            image.header.width,
            image.header.height
        )

        const texture = new PIXI.Texture(baseTexture)
        return new PIXI.Sprite(texture)
    }

    private InitSprite() {
        if (this.sprite == null)
            return;

        this.SETPOSITION(0, 0)
        this.sprite.visible = this.definition.VISIBLE

        this.engine.app.stage.addChild(this.sprite);
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

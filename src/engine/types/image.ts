import {Type} from './index'
import {Engine} from '../index'
import {ImageDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'
import {getIMGFile} from "../../filesLoader";
import * as PIXI from "pixi.js";
import {Sprite} from "pixi.js";

export class Image extends Type<ImageDefinition> {
    private visible: boolean
    private opacity: number = 1
    private priority: number

    private sprite: Sprite

    private x: number = 0
    private y: number = 0

    constructor(engine: Engine, definition: ImageDefinition) {
        super(engine, definition)
        this.visible = definition.VISIBLE
        this.priority = definition.PRIORITY

        this.Load()
    }

    SETOPACITY(opacity: number) {
        this.opacity = opacity
    }

    MOVE(xOffset: number, yOffset: number) {
        this.x += xOffset
        this.y += yOffset
    }

    private Load() { //'DANE/ReksioUfo/PRZYGODA/s1_0_intro1/gwiazdy.img'
        console.log(`Loading file: ${this.definition.FILENAME}`)
        
        getIMGFile(this.definition.FILENAME).then((image) => {
            const baseTexture = PIXI.BaseTexture.fromBuffer(
                new Uint8Array(image.bytes),
                image.header.width,
                image.header.height
            )

            const texture = new PIXI.Texture(baseTexture)
            this.sprite = new PIXI.Sprite(texture)

            this.SETPOSITION(0, 0)
            this.sprite.visible = this.definition.VISIBLE
            this.engine.app.stage.addChild(this.sprite);
        });
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
        this.sprite.visible = true
    }

    HIDE() {
        this.sprite.visible = false
    }

    GETPOSITIONY() {
        return this.y
    }

    GETALPHA(x: number, y: number) {
        throw new NotImplementedError()
    }
}

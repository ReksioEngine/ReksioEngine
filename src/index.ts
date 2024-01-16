import {getANNFile, getIMGFile} from "./filesLoader";
import {Engine} from "./engine";
import * as PIXI from 'pixi.js';
import {Scanner} from "./interpreter/parser";

const main = async () => {
    const engine = new Engine();
    await engine.init();

    const app = new PIXI.Application();
    document.body.appendChild(app.view as unknown as Node);
    app.ticker.maxFPS = 16;

    // Background
    const bgImage = await getIMGFile('DANE/ReksioUfo/PRZYGODA/s1_0_intro1/gwiazdy.img');
    const bgBaseTexture = PIXI.BaseTexture.fromBuffer(new Uint8Array(bgImage.bytes), bgImage.header.width, bgImage.header.height);
    const bgTexture = new PIXI.Texture(bgBaseTexture);

    const bgSprite = new PIXI.Sprite(bgTexture);
    bgSprite.x = 0;
    bgSprite.y = 0;
    app.stage.addChild(bgSprite);

    // Ufo
    const ufo = await getANNFile('DANE/ReksioUfo/PRZYGODA/s1_0_intro1/ufo.ann');
    const ufoBaseTexture = PIXI.BaseTexture.fromBuffer(new Uint8Array(ufo.images[0]), ufo.annImages[0].width, ufo.annImages[0].height);
    const ufoTexture = new PIXI.Texture(ufoBaseTexture);

    const ufoSprite = new PIXI.Sprite(ufoTexture);
    ufoSprite.x = 0;
    ufoSprite.y = 0;
    app.stage.addChild(ufoSprite);

    let currentFrame = 0;
    app.ticker.add(delta => {
        const eventFrame = ufo.events[0].frames[currentFrame];
        ufoSprite.x = ufo.annImages[0].positionX + eventFrame.positionX;
        ufoSprite.y = ufo.annImages[0].positionY + eventFrame.positionY;
        currentFrame = (currentFrame + 1) % ufo.events[0].frames.length;
    });

    const scanner = new Scanner('{THIS^PLAY("1");VARINTRO^SET(-1000);REKSIO^TEST_TH1S(TRUE);}');
    console.log(scanner.scanTokens());
}

main();

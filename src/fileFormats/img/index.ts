import {BinaryBuffer} from "../utils";
import {decompress as CLZWDecompress} from "../compression/clzw";
import {decompress as CRLEDecompress} from "../compression/crle";

interface ImageHeader {
    width: number
    height: number
    bpp: number
    imageLen: number
    compressionType: number
    alphaLen: number
    positionX: number
    positionY: number
}

interface Image {
    header: ImageHeader
    bytes: ArrayBuffer
}

const parseHeader = (view: BinaryBuffer) => {
    const magic = view.getUint32();
    if (magic != 0x4b4950) {
        throw new Error('Not an image');
    }

    const image = {} as ImageHeader;
    image.width = view.getUint32();
    image.height = view.getUint32();
    image.bpp = view.getUint32();
    image.imageLen = view.getUint32();
    view.skip(4);
    image.compressionType = view.getUint32();
    image.alphaLen = view.getUint32();
    image.positionX = view.getUint32();
    image.positionY = view.getUint32();

    return image;
}

// Based on https://github.com/mysliwy112/AM-transcoder/blob/master/src/image.cpp
const convertToRgba32 = (bytes: Uint8Array) => {
    const rgb = new Uint8Array(bytes.byteLength / 2 * 3);

    let counter = 0;
    for (let i = 0; i < bytes.byteLength; i += 2) {
        let temp = bytes[i] + bytes[i + 1] * 256;

        rgb[counter + 2] = (temp % 32) * 8;
        temp /= 32;

        rgb[counter + 1] = (temp % 64) * 4;
        temp /= 64;

        rgb[counter] = (temp % 32) * 8;
        counter += 3;
    }

    return rgb;
}

// Based on https://github.com/mysliwy112/AM-transcoder/blob/master/src/image.cpp
const addAlpha = (imgBytes: Uint8Array, alphaBytes: Uint8Array) => {
    const rgba = new Uint8Array(imgBytes.byteLength + imgBytes.byteLength / 3);
    let al = 0;
    let da = 0;

    for (let i = 0; i < rgba.byteLength; i += 4) {
        rgba[i] = imgBytes[da];
        rgba[i+1] = imgBytes[da+1];
        rgba[i+2] = imgBytes[da+2];
        if (alphaBytes.byteLength == 0) {
            rgba[i+3] = 255;
        } else {
            rgba[i+3] = alphaBytes[al];
        }
        da += 3;
        al++;
    }

    return rgba;
}

export const loadImage = (data: ArrayBuffer): Image => {
    const buffer = new BinaryBuffer(new DataView(data));
    const header = parseHeader(buffer);

    const imgBytes = loadImageWithoutHeader(buffer, header.compressionType, header.imageLen, header.alphaLen);
    return {
        header,
        bytes: imgBytes
    }
}

export const loadImageWithoutHeader = (buffer: BinaryBuffer, compressionType: number, imageLen: number, alphaLen: number) => {
    let imgBytes;
    let alphaBytes;
    if (compressionType == 2) {
        imgBytes = new Uint8Array(CLZWDecompress(buffer));
        alphaBytes = new Uint8Array(CLZWDecompress(buffer));
    } else if (compressionType == 4) {
        const imgBuffer = new BinaryBuffer(new DataView(buffer.read(imageLen)));
        const alphaBuffer = new BinaryBuffer(new DataView(buffer.read(alphaLen)));

        imgBytes = new Uint8Array(CRLEDecompress(imgBuffer, 2));
        alphaBytes = new Uint8Array(CRLEDecompress(alphaBuffer, 1));
    } else {
        imgBytes = new Uint8Array(buffer.read(imageLen));
        alphaBytes = new Uint8Array(buffer.read(alphaLen));
    }

    imgBytes = convertToRgba32(imgBytes);
    return addAlpha(imgBytes, alphaBytes);
}

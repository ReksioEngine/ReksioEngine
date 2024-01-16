import {BinaryBuffer} from "../utils";

const resizeArray = (array: Uint8Array, size: number) => {
    const newBuffer = new Uint8Array(size);
    newBuffer.set(array);
    return newBuffer;
}

// Based on https://github.com/mysliwy112/AM-transcoder/blob/master/include/CRLE.h
export const decompress = (src: BinaryBuffer, bulk: number = 1) => {
    let data = new Uint8Array(src.buffer());

    let n = new Uint8Array();
    let i = 0;
    while (i < data.length) {
        if (data[i] < 128) {
            const subArray = data.slice(i + 1, i + data[i] * bulk + 1);
            const endOfN = n.length;
            n = resizeArray(n, n.length + subArray.length);
            n.set(subArray, endOfN);
            i += data[i] * bulk + 1;
        } else {
            data[i] -= 128;
            const varLength = n.length;
            const newSize = varLength + data[i] * bulk;
            n = resizeArray(n, newSize);

            for (let k = 0; k < data[i]; k++) {
                for (let l = 0; l < bulk; l++) {
                    n[varLength + k * bulk + l] = data[i + l + 1];
                }
            }

            i += 1 + bulk;
        }
    }

    return n;
}

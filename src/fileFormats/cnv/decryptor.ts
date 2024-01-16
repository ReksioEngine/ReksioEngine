const parseHeader = (content: string) => {
    const match = /{<(?<direction>[cCdD]):(?<movement>\d+)>}\r\n/.exec(content);
    if (match == null || match.groups === undefined) {
        throw new Error('Failed to parse encrypted file header');
    }

    const {direction, movement} = match.groups;
    return {
        length: match[0].length,
        direction,
        movement: parseInt(movement, 10)
    }
}

const calcShift = (step: number, movement: number) => {
    step += 1
    if (step > movement) {
        step = 1;
    }
    let shift = (Math.floor(step / 2) + step % 2);
    if (step % 2) {
        shift *= -1;
    }
    return {
        step, shift
    }
}

export const decryptCNV = (content: string): string => {
    const {
        length,
        direction,
        movement
    } = parseHeader(content);

    const directionMultiplier = (direction.toLowerCase() === 'd') ? -1 : 1;
    const payload = content.substring(length);

    let output = '';
    let step = 0;
    let shift = 0;

    for (let pos = 0; pos < payload.length; pos++) {
        if (payload[pos] === '<' && payload[pos + 1] === 'E' && payload[pos + 2] === '>') {
            output += '\n';
            pos += 2;
        } else if (payload[pos] !== '\r' && payload[pos] !== '\n') {
            const newShift = calcShift(step, movement);
            step = newShift.step;
            shift = newShift.shift;

            output += String.fromCharCode(payload.charCodeAt(pos) + shift * directionMultiplier);
        }
    }

    return output;
}

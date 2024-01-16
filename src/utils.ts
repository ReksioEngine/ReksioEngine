export const pathJoin = (...parts: Array<string>) => {
    const fixedParts = parts.map(part => part.replace(/\\/g, '/'));
    return fixedParts.join('/');
}

export const stringUntilNull = (text: string) => {
    return text.substring(0, text.indexOf('\x00'));
}

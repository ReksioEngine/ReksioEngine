export const pathJoin = (...parts: Array<string>) => {
    const fixedParts = parts
        .filter(part => part !== '')
        .map((part) => part.replace(/\\/g, '/'))
    return fixedParts.join('/')
}

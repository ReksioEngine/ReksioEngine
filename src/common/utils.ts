export const pathJoin = (...parts: Array<string>) => {
    const fixedParts = parts.map((part) => part.replace(/\\/g, '/'))
    return fixedParts.join('/')
}

export * as CLZW from './clzw'
export * as CRLE from './crle'

export enum CompressionType {
    NONE,
    CLZW,
    CLZW_IN_CRLE,
    CRLE,
    JPEG,
}

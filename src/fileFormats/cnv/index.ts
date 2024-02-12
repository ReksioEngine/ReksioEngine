export {decryptCNV} from './decryptor'
export {parseCNV} from './parser'

export const getByType = <Type>(cnv: any, type: string) => {
    return Object.values(cnv)
        .filter((obj: any) => obj['TYPE'] === type) as Type
}

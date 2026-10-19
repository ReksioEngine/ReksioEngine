import { ArrayEntry, ArrayEntryType, deserializeArray, serializeArray } from './array'

const integer = (value: number): ArrayEntry => ({ type: ArrayEntryType.INTEGER, value })
const float = (value: number): ArrayEntry => ({ type: ArrayEntryType.FLOAT, value })
const string = (value: string): ArrayEntry => ({ type: ArrayEntryType.STRING, value })
const boolean = (value: boolean): ArrayEntry => ({ type: ArrayEntryType.BOOLEAN, value })

describe('serializeArray', () => {
    it('a small array', () => {
        const data = [integer(1), string('abc'), boolean(true), float(1.5)]
        expect(deserializeArray(serializeArray(data))).toEqual(data)
    })

    it('a whole FLOAT stays a FLOAT', () => {
        const data = [float(2), integer(2)]
        expect(deserializeArray(serializeArray(data))).toEqual(data)
    })

    it('an array larger than the initial 4096 byte buffer', () => {
        const data = Array.from({ length: 1000 }, (_, i) => integer(i))
        expect(deserializeArray(serializeArray(data))).toEqual(data)
    })

    it('long strings that force the buffer to grow', () => {
        const data = [string('a'.repeat(3000)), string('b'.repeat(3000)), integer(42)]
        expect(deserializeArray(serializeArray(data))).toEqual(data)
    })
})

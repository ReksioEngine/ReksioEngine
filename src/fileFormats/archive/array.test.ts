import { deserializeArray, serializeArray } from './array'

describe('serializeArray', () => {
    it('a small array', () => {
        const data = [1, 'abc', true, 1.5]
        expect(deserializeArray(serializeArray(data))).toEqual(data)
    })

    it('an array larger than the initial 4096 byte buffer', () => {
        const data = Array.from({ length: 1000 }, (_, i) => i)
        expect(deserializeArray(serializeArray(data))).toEqual(data)
    })

    it('long strings that force the buffer to grow', () => {
        const data = ['a'.repeat(3000), 'b'.repeat(3000), 42]
        expect(deserializeArray(serializeArray(data))).toEqual(data)
    })
})

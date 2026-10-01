import { getLines } from './parser'

describe('cnv lines parsing', () => {
    test('continuation lines', () => {
        const lines = getLines(`
OBJECT=TEST
TEST:CODE={ /
    OTHER^CALL(); /
    ANOTHER^CALL(); /
}
`)
        expect(lines).toStrictEqual(['OBJECT=TEST', 'TEST:CODE={ OTHER^CALL(); ANOTHER^CALL(); }'])
    })
})
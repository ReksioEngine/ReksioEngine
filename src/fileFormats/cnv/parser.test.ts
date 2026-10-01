import { getLines, parseCNV } from './parser'

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

    test('normal OBJECT lines parsing', () => {
        const cnv = parseCNV(`
OBJECT=TEST1
TEST1:TYPE=ANIMO
TEST1:VISIBLE=TRUE
`)
        expect(cnv).toStrictEqual({
            TEST1: {
                NAME: 'TEST1',
                TYPE: 'ANIMO',
                VISIBLE: true,
            }
        })
    })

    test('leftover tokens in OBJECT line', () => {
        const cnv = parseCNV(`
OBJECT=TEST1:TEST1:TYPE=ANIMO
TEST1:VISIBLE=TRUE

OBJECT=TEST2=TEST2:TYPE=ANIMO
TEST2:RELEASE=TRUE

OBJECT=TEST3:OBJECT=TEST4:TEST4:TYPE=ANIMO
TEST3:TYPE=SEQUENCE
`)
        expect(cnv).toStrictEqual({
            TEST1: {
                NAME: 'TEST1',
                TYPE: 'ANIMO',
                VISIBLE: true,
            },
            TEST2: {
                NAME: 'TEST2',
                TYPE: 'ANIMO',
                RELEASE: true,
            },
            TEST3: {
                NAME: 'TEST3',
                TYPE: 'SEQUENCE',
            },
            TEST4: {
                NAME: 'TEST4',
                TYPE: 'ANIMO',
            },
        })
    })

    test('leftover tokens in attribute assignment line', () => {
        const cnv = parseCNV(`
OBJECT=TEST1
TEST1:TYPE=ANIMO=TEST1:VISIBLE=TRUE
`)
        expect(cnv).toStrictEqual({
            TEST1: {
                NAME: 'TEST1',
                TYPE: 'ANIMO TEST1 VISIBLE TRUE',
            },
        })
    })
})

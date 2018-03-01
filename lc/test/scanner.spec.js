
describe('scanner', () => {
    const {scan, Tokens, Token} = require('../scanner');
    const {
        BracketOpen, BracketClose, EOF, Dot,
        Variable, Literal, Lambda, Let, In, Equal, Comma
    } = Token;
    const {deepStrictEqual} = require('assert');

    const lc = (line, col) => ({line, col});

    [
        [
            ``,
            [EOF(lc(1, 1))]
        ],
        [
            `  (  \n  )  `,
            [BracketOpen(lc(1, 3)), BracketClose(lc(2, 3)), EOF(lc(2, 6))]
        ],
        [
            `λx.x`,
            [Lambda(lc(1, 1)), Variable(lc(1, 2), 'x'), Dot(lc(1, 3)), Variable(lc(1, 4), 'x'), EOF(lc(1, 5))]
        ],
        [
            `( \\left . \\right . left )`,
            [BracketOpen(lc(1, 1)),
                Lambda(lc(1, 3)), Variable(lc(1, 4), 'left'), Dot(lc(1, 9)),
                    Lambda(lc(1, 11)), Variable(lc(1, 12), 'right'), Dot(lc(1, 18)), Variable(lc(1, 20), 'left'),
             BracketClose(lc(1, 25)), EOF(lc(1, 26))]
        ],
        [
            `__underscore`,
            [Variable(lc(1,1), '__underscore'), EOF(lc(1, 13))]
        ],
        [
            `camelCase`,
            [Variable(lc(1,1), 'camelCase'), EOF(lc(1, 10))]
        ],
        [
            `12345`,
            [Literal(lc(1,1), '12345'), EOF(lc(1, 6))]
        ],
        [
            `1_2_345`,
            [Literal(lc(1,1), '12345'), EOF(lc(1, 8))]
        ],
        [
            `let x = y in z`,
            [
                Let(lc(1,1)), Variable(lc(1,5), 'x'), Equal(lc(1,7)),
                Variable(lc(1,9), 'y'), In(lc(1, 11)), Variable(lc(1,14), 'z'),
                EOF(lc(1, 15))
            ]
        ],
        [
            `let x = y, y = x in z`,
            [
                Let(lc(1,1)),
                Variable(lc(1,5), 'x'), Equal(lc(1,7)), Variable(lc(1,9), 'y'),
                Comma(lc(1, 10)),
                Variable(lc(1,12), 'y'), Equal(lc(1,14)), Variable(lc(1,16), 'x'),
                In(lc(1, 18)),
                Variable(lc(1,21), 'z'),
                EOF(lc(1, 22))
            ]
        ]
    ].forEach(([src, expected], i) => {
        it(`Correctly scans '${src.replace(/\n/g, '\\n')}'`, function() {
            this.timeout(50);
            deepStrictEqual(
                Array.from(scan(src)),
                expected
            );
        });
    });
});

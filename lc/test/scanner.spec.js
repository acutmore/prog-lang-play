describe('scanner', () => {
    const {scan, Tokens} = require('../scanner');
    const {BracketOpen, BracketClose, EOF, Dot, Variable, Lambda} = Tokens;
    const {deepStrictEqual} = require('assert');

    [
        [
            ``,
            [EOF]
        ],
        [
            `  (  \n  )  `,
            [BracketOpen, BracketClose, EOF]
        ],
        [
            `λx.x`,
            [Lambda, Variable('x'), Dot, Variable('x'), EOF]
        ],
        [
            `λx.x`,
            [Lambda, Variable('x'), Dot, Variable('x'), EOF]
        ],
        [
            `( \\left . \\right . left )`,
            [BracketOpen,
                Lambda, Variable('left'), Dot,
                    Lambda, Variable('right'), Dot, Variable('left'),
             BracketClose, EOF]
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

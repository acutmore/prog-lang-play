
describe('generateHighlightRules', () => {
    const {deepStrictEqual, strictEqual} = require('assert');
    const {generateHighlightRules} = require('../src/generateHighlightRules');

    it('highlights from 0 to 9', () => {
        strictEqual(
            generateHighlightRules(0, 9),
`span[data-lc-start^="0b0000000000000000"],
span[data-lc-end^="0b0000000000001001"],
span[data-lc-start^="0b0000000000000"],
span[data-lc-start^="0b0000000000001000"] { background-color: lightskyblue; }
`
        );
    });

    it('highlights from 4 to 6', () => {
        strictEqual(
            generateHighlightRules(4, 6),
`span[data-lc-start^="0b0000000000000100"],
span[data-lc-end^="0b0000000000000110"],
span[data-lc-start^="0b00000000000000"],
span[data-lc-start^="0b000000000000010"] { background-color: lightskyblue; }
span[data-lc-end^="0b00000000000000"] { background-color: unset }
`
        );
    });

});

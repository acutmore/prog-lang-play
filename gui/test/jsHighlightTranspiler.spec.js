
describe('jsHighlightTranspiler', () => {
    const {deepStrictEqual, strictEqual} = require('assert');
    const {frontend} = require('../../lc');
    const {jsHighlightTranspiler} = require('../src/jsHighlightTranspiler');

    function highlight([pre, post], highlighted) {
        return {
            str: pre + highlighted + post,
            pos: {
                start: {
                    line: pre.split('\n').length,
                    col: pre.split('\n').slice(-1)[0].length + 1
                },
                end: {
                    line: (pre + highlighted).split('\n').length,
                    col: (pre + highlighted).split('\n').slice(-1)[0].length
                }
            }
        };
    }

    it('highlighter returns full string', () => {
        const {str} = highlight`hello ${`world`}!`;
        strictEqual(
            str,
            `hello world!`
        );
    });

    it('highlighter returns highlight position', () => {
        const {pos} = highlight`line 1\nhello ${`wor\nld`}!`;
        deepStrictEqual(
            pos,
            {
                start: { line: 2, col: 7 },
                end: { line: 3, col: 2 }
            }
        );
    });

    function transpile(strings, highlighted) {
        const {str, pos: {start, end}} = highlight(strings, highlighted);
        const program = frontend(str);
        return program.accept(new jsHighlightTranspiler(start, end));
    }

    it('highlights function body symbol', () => {
        strictEqual(
            transpile`λa.${`a`}`,
            `(a => <b>a</b>)`
        );
    });

    it('highlights function param symbol', () => {
        strictEqual(
            transpile`λ${`a`}.a`,
            `(<b>a</b> => a)`
        );
    });

});

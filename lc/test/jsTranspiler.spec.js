
describe('jsTranspiler', () => {
    const {strictEqual} = require('assert');
    const {scan} = require('../scanner');
    const {parse} = require('../parser');
    const {JavascriptVisitor} = require('../jsTranspiler');

    function transpile(inputStr) {
        const exp = parse(scan(inputStr));
        return exp.accept(new JavascriptVisitor());
    }

    it('generates javascript identity function', () => {
        strictEqual(
            transpile(`λa.a`),
            `(a => a)`
        );
    });

    it('generates javascript function call', () => {
        strictEqual(
            transpile(`a b`),
            `a(b)`
        );
    });

    it(`numeric literal '0' changed into Church numerial`, () => {
        strictEqual(
            transpile(`0`),
            `(f => (x => x))`
        );
    });

    it(`numeric literal '1' changed into Church numerial`, () => {
        strictEqual(
            transpile(`1`),
            `(f => (x => f(x)))`
        );
    });

    it('compiles small program', () => {
        strictEqual(
            transpile(`(λa.λb.a b) foo bar`),
            `(a => (b => a(b)))(foo)(bar)`
        );
    });

});

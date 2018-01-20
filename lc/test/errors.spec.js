
describe('errors', () => {
    const {equal} = require('assert');
    const {scan} = require('../scanner');
    const {parse} = require('../parser');
    const {CompilerError} = require('../errors');

    const compile = src => () => parse(scan(src));

    const assertError = (source, msg) => (err) => {
        equal(typeof err, 'object');
        equal(err instanceof Error, true);
        equal(err instanceof CompilerError, true);
        equal(err.userMessage(source), msg.join('\n'));
    };

    const exception = work => {
        try {
            work();
        } catch (e) {
            return e;
        }
        return void 0;
    };

    it('Describes an unexpected token', () => {
        const source = `((λi . i)(λt % t))`;
        assertError(source, [
            `unexpected token '%'`,
            `i)(λt % t))`,
            `      ^`
        ])(exception(compile(source)));
    });

    it('Describes illegal syntax', () => {
        const source = `((λi . i)(λt λ t))`;
        assertError(source, [
            `Expected DOT but saw LAMB`,
            `i)(λt λ t))`,
            `      ^`
        ])(exception(compile(source)));
    });
});

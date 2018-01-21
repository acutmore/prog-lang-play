// @ts-check

const { Token, Tokens } = require('./scanner');
const { PeekIterator } = require('./peekIterator');
const { CompilerError } = require('./errors');
const { Expression, VariableExpression, FunctionExpression, ApplyExpression } = require('./expressions');
const { BracketOpen, BracketClose, Lambda, Dot, Var, EOF } = Tokens;

/**
 * program -> expression EOF .
 * expression -> apply .
 * apply -> lamb lamb* .
 * lamb -> `λ` VAR `.` apply .
 * lamb -> primary .
 * primary -> `(` expression `)` .
 * primary -> VAR .
 */

/**
 * program -> expression EOF .
 * @param {iPeekIterator<Token>} it
 * @returns {Expression}
 */
function program(it) {
    const e = expression(it);
    expect(EOF, it.advance());
    return e;
}

/**
 * expression -> apply .
 * @param {iPeekIterator<Token>} it
 * @returns {Expression}
 */
function expression(it) {
    return apply(it);
}

/**
 * apply -> lamb lamb* .
 * @param {iPeekIterator<Token>} it
 * @returns {Expression}
 */
function apply(it) {
    let exp = lamb(it);
    greedy: for (;;) {
        const p = it.peek();
        switch (p.type) {
            case BracketOpen:
            case Lambda:
            case Var:
                const right = lamb(it);
                exp = new ApplyExpression(exp, right);
                break;
            default:
                break greedy;
        }
    }
    return exp;
}

/**
 * lamb -> `λ` VAR `.` apply .
 * lamb -> prmary .
 * @param {iPeekIterator<Token>} it
 * @returns {Expression}
 */
function lamb(it) {
    if (test(Lambda, it.peek())) {
        it.advance();
        const id = expect(Var, it.advance());
        expect(Dot, it.advance());
        const body = apply(it);
        return new FunctionExpression(id, body);
    }
    return primary(it);
}

/**
 * primary -> '(' expression ')' .
 * primary -> VAR .
 * @param {iPeekIterator<Token>} it
 * @returns {Expression}
 */
function primary(it) {
    if (test(BracketOpen, it.peek())) {
        it.advance();
        const e = expression(it);
        expect(BracketClose, it.advance());
        return e;
    }
    const id = expect(Var, it.advance());
    return new VariableExpression(id);
}

/**
 * @param {Iterator<Token>} tokens
 * @returns {Expression}
 */
function parse(tokens) {
    /** @type{iPeekIterator<Token>} */
    const it = new PeekIterator(tokens);
    return program(it);
}

/**
 * @param {string} expectedType
 * @param {Token} token
 * @throws {Error}
 */
function expect(expectedType, token) {
    if (expectedType !== token.type) {
        throw new CompilerError(
            `Expected ${expectedType} but saw ${token.type}`,
            token
        );
    }
    return token;
}

/**
 * @param {string} expectedType
 * @param {Token} token
 * @returns {boolean}
 */
function test(expectedType, token) {
    return expectedType === token.type;
}

exports.parse = parse;

// @ts-check

const {Token, Tokens} = require('./scanner');
const {PeekIterator} = require('./peekIterator');
const { BracketOpen, BracketClose, Lambda, Dot, Variable, EOF } = Token;

/**
 * @param {string} expectedType
 * @param {Token} token
 * @throws {Error}
 */
function expect(expectedType, token) {
   if (expectedType !== token.type) {
       const err = new Error(`Expected ${expectedType} but saw ${token.type}`);
       err.at = token;
       throw err;
   }
}

/**
 * @param {string} expectedType
 * @param {Token} token
 * @returns {boolean}
 */
function test(expectedType, token) {
    return expectedType === token.type;
}

class FunctionExpression {
    constructor(paramId, body) {
        this.paramId = paramId;
        this.body = body;
    }

    js() {
        return `(${this.paramId} => (${this.body.js()}))`;
    }
}

class ApplyExpression {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    js() {
        return `(${this.left.js()}(${this.right.js()}))`;
    }
}

/**
 * program = abstration | application.
 * @param {iPeekIterator<Token>} it
 */
function program(it) {
    expect(Tokens.BracketOpen, it.peek(1));
    if (test(Tokens.Lambda, it.peek(2))) {
        return abstraction(it);
    }
    return application(it);
}

/**
 * abstration = '(' '\' VAR '.' term ')'.
 * @param {iPeekIterator<Token>} it
 */
function abstraction(it) {
    expect(Tokens.BracketOpen, it.peek());
    it.advance();
    expect(Tokens.Lambda, it.peek());
    it.advance();
    expect(Tokens.Var, it.peek());
    const v = it.advance();
    expect(Tokens.Dot, it.peek());
    it.advance();
    const t = term(it);
    expect(Tokens.BracketClose, it.peek());
    it.advance();
    return new FunctionExpression(v, t);
}

/**
 * application = '(' term term ')'.
 * @param {iPeekIterator<Token>} it
 */
function application(it) {
    expect(Tokens.BracketOpen, it.peek());
    it.advance();
    const l = term(it);
    const r = term(it);
    expect(Tokens.BracketClose, it.peek());
    it.advance();
    return new ApplyExpression(l, r);
}

/**
 * term = VAR | program.
 * @param {iPeekIterator<Token>} it
 */
function term(it) {
    if (test(Tokens.Var, it.peek())) {
        return it.advance();
    }
    return program(it);
}

/**
 * @param {Iterator<Token>} tokens
 */
function parse(tokens) {
    /** @type{iPeekIterator<Token>} */
    const it = new PeekIterator(tokens);
    return program(it);
}

exports.parse = parse;

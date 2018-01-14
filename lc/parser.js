// @ts-check

const Token = require('./scanner').Tokens;
const PeekIterator = require('./peekIterator').PeekIterator;

class FunctionExpression {
    constructor(paramId, body) {
        this.paramId = paramId;
        this.body = body;
    }

    js() {
        return `(${this.paramId} => (${this.body.js()}))`;
    }
}

class AppyExpression {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    js() {
        return `(${this.left.js()}(${this.right.js()}))`;
    }
}

/**
 * @param {iPeekIterator<Token>} it
 */
function lamda(it) {
    if (it.peek().type !== Token.Variable) {
        throw new Error(`Expected Variable but saw ${it.peek()}`);
    }
    const arg = it.advance().value;
    if (it.peek().type !== Token.Dot) {
        throw new Error(`Expected Dot but saw ${it.peek()}`);
    }
    it.advance(); // DOT

}

/**
 * @param {iPeekIterator<Token>} it
 */
function expression(it) {
    const p = it.peek();
    switch (p.type) {
        case Token.Lambda:
            it.advance();
            return lamda(it);
        case Token.BracketOpen:
            it.advance();
            const e = expression(it);
            if (it.peek() === Token.BracketClose) {
                return e;
            }
            if (it.peek() === Token.BracketOpen) {
                it.advance();
                const e2 = expression(it);
                if (it.peek() === Token.BracketClose) {
                    it.advance();
                    return new AppyExpression(e, e2);
                }
                throw new Error(`Expected AppyExpression but saw ${it.peek()}`);
            }
            break
    }
}

/**
 * @param {Iterator<Token>} tokens 
 */
function program(tokens) {
    /** @type{iPeekIterator<Token>} */
    const it = new PeekIterator(tokens);
    const t = it.advance();
    switch (t.type) {
        case Token.BracketOpen:
            const leftE = expression(it);
            if (it.peek() !== Token.BracketClose) {
                throw new Error(`Expecting ${Token.BracketClose} but got ${it.peek()}`);
            }
            it.advance(); // bracketClose
            if (it.peek() !== Token.BracketOpen) {
                throw new Error(`Expecting ${Token.BracketOpen} but got ${it.peek()}`);
            }
            it.advance(); // bracketOpen
            const rightE = expression(it);
            if (it.peek() !== Token.BracketClose) {
                throw new Error(`Expecting ${Token.BracketClose} but got ${it.peek()}`);
            }
            it.advance(); // bracketClose 
            const e =  new AppyExpression(leftE, rightE);
            if (it.peek() !== Token.EOF) {
                throw new Error(`Expecting ${Token.EOF} but got ${it.peek()}`);
            }
            it.advance();
            break;
        default:
            throw new Error(`Unexpected token ${t}`);
    }
}

exports.program = program;

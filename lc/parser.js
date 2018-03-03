// @ts-check

const { Token, Tokens } = require('./scanner');
const { PeekIterator } = require('./peekIterator');
const { CompilerError } = require('./errors');
const {
    Expression, VariableExpression, FunctionExpression, ApplyExpression
    } = require('./expressions');
const {
    BracketOpen, BracketClose, Lambda, Dot,
    Var, Literal, Let, Equal, In, Comma, EOF
    } = Tokens;

/**
 * program -> expression EOF .
 * expression -> apply .
 * apply -> lamb lamb* .
 * lamb -> `λ` VAR `.` apply .
 * lamb -> primary .
 * primary -> `(` expression `)` .
 * primary -> `let` VAR `=` expression (`,` VAR `=` expression)* `in` expression .
 * primary -> VAR .
 * primary -> LIT.
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
            case Literal:
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
 * primary -> `let` VAR `=` expression (`,` VAR `=` expression)* `in` expression .
 * primary -> VAR .
 * primary -> LIT .
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
    if (test(Let, it.peek())) {
        return letExpression(it);
    }
    if (test(Var, it.peek())) {
        const id = it.advance();
        return new VariableExpression(id);
    }
    const literal = expect(Literal, it.advance());
    return church_numeral(Number.parseInt(literal.value, 10), literal);
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

/**
 * De-sugars a number into a church numerial
 * @param {number} value
 * @param {{line: number, col: number}} pos
 * @returns {Expression}
 */
function church_numeral(value, pos) {
    const fVar = Token.Variable(pos, 'f');
    const xVar = Token.Variable(pos, 'x');
    const f = new VariableExpression(fVar);
    const x = new VariableExpression(xVar);

    const body = Array.from({length: value})
        .reduce(expression => new ApplyExpression(f, expression), x);

    return new FunctionExpression(fVar, new FunctionExpression(xVar, body));
}

/**
 * De-sugars a let expresssion into function application
 * `let` VAR `=` expression (`,` VAR `=` expression)* `in` expression
 * @param {iPeekIterator<Token>} it
 * @returns {Expression}
 */
function letExpression(it) {
    expect(Let, it.advance());
    const bindings = [];
    while (true) {
        const id = expect(Var, it.advance());
        expect(Equal, it.advance());
        const val = expression(it);
        bindings.push({id, val});
        if (test(Comma, it.peek())) {
            it.advance();
        } else {
            break;
        }
    }
    expect(In, it.advance());
    const exp = expression(it);
    const curried = bindings.reduceRight(
        (acc, {id}) => new FunctionExpression(id, acc), exp
    );
    return bindings.reduce(
        (acc, {val}) => new ApplyExpression(acc, val), curried
    );
}

exports.parse = parse;

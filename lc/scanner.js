// @ts-check

const PeekIterator = require('./peekIterator').PeekIterator;
const {CompilerError} = require('./errors');

function isWhitespace(char) {
    return /\s/.test(char);
}

class FileIterator {

    /**
     * @param {Iterator<string>} [srcIterator] - Iterator for source file
    */
    constructor(srcIterator) {
        /** @type{iPeekIterator<string>} */
        this.peekIterator = new PeekIterator(srcIterator);
        this.line = 1;
        this.col = 0;
    }

    advance() {
        if (this.peekIterator.currentPos !== void 0
            && this.peekIterator.currentPos.value === '\n'
        ) {
            this.line++;
            this.col = 1;
        } else {
            this.col++;
        }
        return this.peekIterator.advance();
    }

    peek() {
        return this.peekIterator.peek();
    }

    done() {
        return this.peekIterator.done();
    }
}

class Token {
    /**
     * @param {string} type
     * @param {number} line
     * @param {number} col
     * @param {string?} value
     */
    constructor(type, line, col, value) {
        this.type = type;
        this.line = line;
        this.col = col;
        this.value = value;
    }

    inspect() {
        if (this.type === 'VAR') {
            return `@${this.value}`;
        }
        return this.type;
    }

    toString() {
        return this.inspect();
    }
}

const Tokens = {
    Lambda:        'LAMB',
    Dot:           'DOT',
    BracketOpen:   '(',
    BracketClose:  ')',
    Var:           'VAR',
    EOF:           'EOF'
};

Token.Lambda       = ({line, col}) => new Token(Tokens.Lambda, line, col, void 0);
Token.Dot          = ({line, col}) => new Token(Tokens.Dot, line, col, void 0);
Token.BracketOpen  = ({line, col}) => new Token(Tokens.BracketOpen, line, col, void 0);
Token.BracketClose = ({line, col}) => new Token(Tokens.BracketClose, line, col, void 0);
Token.EOF          = ({line, col}) => new Token(Tokens.EOF, line, col, void 0);
Token.Variable     = ({line, col}, name) => new Token(Tokens.Var, line, col, name);

/**
 * @param {string} inputStr
 * @returns {IterableIterator<Token>}
 */
function* scan(inputStr) {
    const it = new FileIterator(inputStr[Symbol.iterator]());

    for (;;) {
        const char = it.advance();
        if (it.done()) {
            break;
        }

        if (isWhitespace(char)) {
            continue;
        }

        if (/[a-z_]/i.test(char)) {
            const pos = { line: it.line, col: it.col };
            let str = char;
            for (;;) {
                if (/[a-z0-9_]/i.test(it.peek())) {
                    str += it.advance();
                    continue;
                }
                break;
            }
            yield Token.Variable(pos, str);
            continue;
        }

        switch (char) {
            case '(':
                yield Token.BracketOpen(it);
                continue;
            case ')':
                yield Token.BracketClose(it);
                continue;
            case 'λ':
            case '\\':
                yield Token.Lambda(it);
                continue;
            case '.':
                yield Token.Dot(it);
                continue;
            default:
                throw new CompilerError(
                    `unexpected token '${char}'`,
                    it
                );
        }
    }

    yield Token.EOF(it);
}

exports.scan = scan;
exports.Token = Token;
exports.Tokens = Tokens;

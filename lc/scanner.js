// @ts-check

const PeekIterator = require('./peekIterator').PeekIterator;

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
     * @param {string?} value 
     */
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    inspect() {
        if (this.type === 'VAR') {
            return `@${this.value}`;
        }
        return this.type;
    }
}

Token.Lambda       = new Token('LAMB', void 0);
Token.Dot          = new Token('DOT', void 0);
Token.BracketOpen  = new Token('(', void 0);
Token.BracketClose = new Token(')', void 0);
Token.EOF          = new Token('EOF', void 0);
Token.Variable     = name => new Token('VAR', name);

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

        if (/[a-z]/i.test(char)) {
            let str = char;
            for (;;) {
                if (/[a-z0-9_]/.test(it.peek())) {
                    str += it.advance();
                    continue;
                }
                break;
            }
            yield Token.Variable(str);
            continue;
        }

        switch (char) {
            case '(':
                yield Token.BracketOpen;
                continue;
            case ')':
                yield Token.BracketClose;
                continue;
            case 'λ':
            case '\\':
                yield Token.Lambda;
                continue;
            case '.':
                yield Token.Dot;
                continue;
            default:
                throw new Error(`unexpected token '${char}' @ ${it.line}:${it.col}`);
        }
    }

    yield Token.EOF;
}

exports.scan = scan;
exports.Tokens = Token;

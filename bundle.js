/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

// @ts-check
/// <reference path="./expressions.d.ts" />

const {Token} = __webpack_require__(1);

class Expression {
    /**
     * @param {ExpressionVisitor} visitor
     */
    accept(visitor) {
        return visitor.empty();
    }
}

class ExpressionVisitor {
    /**
     * @param {any} empty : T
     */
    constructor(empty) {
        this.e = empty;
    }
    empty() {
        return this.e;
    }
    /**
     * @param {VariableExpression} ve
     */
    visitVariable(ve) {
        return this.e;
    }
    /**
     * @param {FunctionExpression} fe
     */
    visitFunction(fe) {
        return this.e;
    }
    /**
     * @param {ApplyExpression} ae
     */
    visitApplication(ae) {
        return this.e;
    }
}

class VariableExpression extends Expression {
    /**
     * @param {Token} id
     */
    constructor(id) {
        super();
        this.id = id;
    }

    /**
     * @param {ExpressionVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitVariable(this);
    }
}

class FunctionExpression extends Expression {
     /**
     * @param {Token} paramId
     * @param {Expression} body
     */
    constructor(paramId, body) {
        super();
        this.paramId = paramId;
        this.body = body;
    }

    /**
     * @param {ExpressionVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitFunction(this);
    }
}

class ApplyExpression extends Expression {
    /**
     * @param {Expression} left
     * @param {Expression} right
     */
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }

    /**
     * @param {ExpressionVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitApplication(this);
    }
}

exports.Expression = Expression;
exports.ExpressionVisitor = ExpressionVisitor;
exports.VariableExpression = VariableExpression;
exports.FunctionExpression = FunctionExpression;
exports.ApplyExpression = ApplyExpression;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// @ts-check

const PeekIterator = __webpack_require__(3).PeekIterator;
const {CompilerError} = __webpack_require__(4);

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
    Literal:       'LIT',
    Let:           'LET',
    Equal:         'EQUAL',
    In:            'IN',
    Comma:         ',',
    EOF:           'EOF'
};

Token.Lambda       = ({line, col}) => new Token(Tokens.Lambda, line, col, void 0);
Token.Dot          = ({line, col}) => new Token(Tokens.Dot, line, col, void 0);
Token.BracketOpen  = ({line, col}) => new Token(Tokens.BracketOpen, line, col, void 0);
Token.BracketClose = ({line, col}) => new Token(Tokens.BracketClose, line, col, void 0);
Token.EOF          = ({line, col}) => new Token(Tokens.EOF, line, col, void 0);
Token.Let          = ({line, col}) => new Token(Tokens.Let, line, col, void 0);
Token.Equal        = ({line, col}) => new Token(Tokens.Equal, line, col, void 0);
Token.In           = ({line, col}) => new Token(Tokens.In, line, col, void 0);
Token.Comma        = ({line, col}) => new Token(Tokens.Comma, line, col, void 0);
Token.Variable     = ({line, col}, name) => new Token(Tokens.Var, line, col, name);
Token.Literal      = ({line, col}, text) => new Token(Tokens.Literal, line, col, text);

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
            const str = char + consume(/[a-z0-9_]/i, it);
            switch (str) {
                case 'let':
                    yield Token.Let(pos);
                    break;
                case 'in':
                    yield Token.In(pos);
                    break;
                default:
                    yield Token.Variable(pos, str);
            }
            continue;
        }

        if (/[0-9]/.test(char)) {
            const pos = { line: it.line, col: it.col };
            const num = char + consume(/[0-9_]/, it).replace(/[_]/g, '');
            yield Token.Literal(pos, num);
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
            case ',':
                yield Token.Comma(it);
                continue;
            case '=':
                yield Token.Equal(it);
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

/**
 * @param {RegExp} pattern
 * @param {FileIterator} it
 * @returns {string}
 */
function consume(pattern, it) {
    let retVal = '';
    for (;;) {
        if (! pattern.test(it.peek())) {
            break;
        }
        retVal += it.advance();
    }
    return retVal;
}

exports.scan = scan;
exports.Token = Token;
exports.Tokens = Tokens;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

// @ts-check
/// <reference path="./expressions.d.ts" />

const {scan} = __webpack_require__(1);
const {parse} = __webpack_require__(6);
const {Expression} = __webpack_require__(0);
const {JavascriptVisitor} = __webpack_require__(7);

/**
 * @param {string} str
 * @returns {Expression}
 */
function frontend(str) {
    const tokens = scan(str);
    return parse(tokens);
}

/**
 * @param {string} str
 * @returns {string}
 */
function compileToJs(str) {
    const program = frontend(str);
    const visitor = new JavascriptVisitor();
    return program.accept(visitor);
}

exports.scan = scan;
exports.parse = parse;
exports.frontend = frontend;
exports.compileToJs = compileToJs;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

// @ts-check
/// <reference path="./peekIteratorInterface.d.ts" />

/**
 * @template T
 * @implements {iPeekIterator<T>}
 */
class PeekIterator {

    /**
     * @template T
     * @param {Iterator<T>} [srcIterator] - Iterator being wrapped
     * @returns {iPeekIterator<T>}
     */
    constructor(srcIterator) {
        this.iterator = srcIterator;
        /** @type{IteratorResult<T>} */
        this.currentPos = void 0;
        this.index = -1;
        /** @type{Map<number, IteratorResult<T>>} */
        this.peekCache = new Map();
    }

    advance() {
        this.index++;
        let pos = this.peekCache.get(this.index);
        if (pos !== void 0) {
            this.peekCache.delete(this.index);
        } else {
            pos = this.iterator.next();
        }
        this.currentPos = pos;
        return this.__itValue(pos);
    }

    peek(i = 1) {
        if (i < 1) {
            throw new Error('peek distance must be >= 1');
        }

        const nextIndex = this.index + i;
        const peekPos = this.peekCache.get(nextIndex);
        if (peekPos !== void 0) {
            return this.__itValue(peekPos);
        }
        if (i > 1) {
            this.peek(i - 1);
        }
        const n = this.iterator.next();
        this.peekCache.set(nextIndex, n);
        return this.__itValue(n);
    }

    done() {
        return this.currentPos !== void 0 && this.currentPos.done;
    }

    /**
     * @template T
     * @param {IteratorResult<T>} i 
     */
    __itValue(i) {
        if (i.done) {
            return '\0';
        } else {
            return i.value;
        }
    }
}

exports.PeekIterator = PeekIterator;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

// @ts-check

class CompilerError extends Error {

    /**
     * @param {string} msg
     * @param {{line: number, col: number}} pos
     */
    constructor(msg, pos) {
        super(msg);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CompilerError);
        }
        this.pos = pos;
    }

    /**
     * @param {string} src
     * @returns {string}
     */
    userMessage(src) {
        const {line, col} = this.pos;
        const str = src.split('\n')[line - 1];
        const start = Math.max(0, col - 7);
        return [
            `${this.message}`,
            `${str.substr(start, 14)}`,
            // `${''.padStart(padding, ' ')}^`
            `${``.padStart(col - start - 1, ' ')}^`
        ].join('\n');
    }
}

exports.CompilerError = CompilerError;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const input = document.getElementById('input');
const output = document.getElementById('output');
const evalButton = document.getElementById('eval-output');
const {frontend} = __webpack_require__(2);
const JsHighlighter = __webpack_require__(8).jsHighlightTranspiler;
const {linePositions, shiftToTokenStart} = __webpack_require__(9);
const {evaluateScript} = __webpack_require__(10);

function compileWithHighlight(input, start, end) {
    const program = frontend(input);
    const shiftedStart = shiftToTokenStart(input, start);
    return program.accept(new JsHighlighter(shiftedStart, end));
}

function processInput() {
    const inStr = input.value;
    const {start, end} = linePositions(inStr, input.selectionStart, input.selectionEnd);

    try {
        output.innerHTML = compileWithHighlight(inStr, start, end);
    } catch (e) {
        if (e && e.userMessage) {
            output.innerText = e.userMessage(input.value);
        } else {
            console.error(e);
            output.innerText = `! Unexpected error`;
        }
    }
}

input.onkeyup = processInput;
input.onchange = processInput;
document.onselectionchange = processInput;
window.onselectionchange = processInput;

evalButton.onclick = () => {
    evaluateScript(output.innerText).then(console.log, console.error);
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// @ts-check

const { Token, Tokens } = __webpack_require__(1);
const { PeekIterator } = __webpack_require__(3);
const { CompilerError } = __webpack_require__(4);
const {
    Expression, VariableExpression, FunctionExpression, ApplyExpression
    } = __webpack_require__(0);
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


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// @ts-check
/// <reference path="./expressions.d.ts" />

const {
    ExpressionVisitor,
    VariableExpression,
    FunctionExpression,
    ApplyExpression
    } = __webpack_require__(0);

/**
 * @augments ExpressionVisitor<string>
 */
 class JavascriptVisitor extends ExpressionVisitor {
    constructor() {
        super("");
    }
    /**
     * @param {VariableExpression} ve
     * @returns {string}
     */
    visitVariable(ve) {
        return ve.id.value;
    }
    /**
     * @param {FunctionExpression} fe
     * @returns {string}
     */
    visitFunction(fe) {
        return `(${fe.paramId.value} => ${fe.body.accept(this)})`;
    }
    /**
     * @param {ApplyExpression} ae
     * @returns {string}
     */
    visitApplication(ae) {
        return `${ae.left.accept(this)}(${ae.right.accept(this)})`;
    }
}

exports.JavascriptVisitor = JavascriptVisitor;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// @ts-check
/// <reference path="../../lc/expressions.d.ts" />

const {
    ExpressionVisitor,
    VariableExpression,
    FunctionExpression,
    ApplyExpression
    } = __webpack_require__(0);

/**
 * @augments ExpressionVisitor<string>
 */
 class JavascriptVisitor extends ExpressionVisitor {
    constructor(start, end) {
        super("");
        this.start = start;
        this.end = end;
    }
    /**
     * @param {VariableExpression} ve
     * @returns {string}
     */
    visitVariable(ve) {
        if (this.__tokenInRange(ve.id)) {
            return `<b>${ve.id.value}</b>`;
        }
        return ve.id.value;
    }
    /**
     * @param {FunctionExpression} fe
     * @returns {string}
     */
    visitFunction(fe) {
        if (this.__tokenInRange(fe.paramId)) {
            return `(<b>${fe.paramId.value}</b> => ${fe.body.accept(this)})`;
        }
        return `(${fe.paramId.value} => ${fe.body.accept(this)})`;
    }
    /**
     * @param {ApplyExpression} ae
     * @returns {string}
     */
    visitApplication(ae) {
        return `${ae.left.accept(this)}(${ae.right.accept(this)})`;
    }
    /**
     * @param {{line: number, col: number}} token
     * @returns {boolean}
     */
    __tokenInRange(token) {
        return this.__tokenBeyondStart(token) && this.__tokenBeforeEnd(token);
    }

    /**
     * @param {{line: number, col: number}} token
     * @returns {boolean}
     */
    __tokenBeyondStart(token) {
        return token.line > this.start.line
            || (token.line === this.start.line
                && token.col >= this.start.col);
    }

     /**
     * @param {{line: number, col: number}} token
     * @returns {boolean}
     */
    __tokenBeforeEnd(token) {
        return token.line < this.end.line
            || (token.line === this.end.line
                && token.col <= this.end.col);
    }
}

exports.jsHighlightTranspiler = JavascriptVisitor;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const {scan} = __webpack_require__(2);

/**
* @typedef {Object} LinePos
* @property {number} line- a string property of SpecialType
* @property {number} col - a number property of SpecialType
*/

/**
 * @param {string} inStr
 * @param {number} startIndex
 * @param {number} endIndex
 * @returns {{start: LinePos, end: LinePos}}
 */
function linePositions(inStr, startIndex, endIndex) {
    let startLine = 0;
    let startCol = 0;
    let endLine = 0;
    let endCol = 0;
    let currentLine = 1;
    let currentCol = 1;
    for (let index = 0; index < inStr.length; index++) {
        if (index === startIndex) {
            startLine = currentLine;
            startCol = currentCol;
        }
        if (index === endIndex) {
            endLine = currentLine;
            endCol = currentCol;
        }
        currentCol++;
        if (inStr[index] === '\n') {
            currentLine++;
            currentCol = 1;
        }
    }
    if (startIndex >= inStr.length) {
        startLine = currentLine;
        startCol = currentCol - 1;
    }
    if (endIndex >= inStr.length) {
        endLine = currentLine;
        endCol = currentCol - 1;
    }
    return {
        start: {
            line: startLine,
            col: startCol
        },
        end: {
            line: endLine,
            col: endCol,
        }
    };
}

/**
 * Given the input string and a LinePos will shift the LinePos down
 * so that it lines up with the start of the overlapping token
 * @param {string} inputStr
 * @param {LinePos} startPos
 * @returns {LinePos}
 */
function shiftToTokenStart(inputStr, startPos) {
    /** @type {LinePos} */
    let lastTokenPos = undefined;
    for (const token of scan(inputStr)) {
        const passed = token.line > startPos.line
            || (token.line === startPos.line
                && token.col >= startPos.col);
        if (passed) {
            break;
        }
        lastTokenPos = {
            line: token.line,
            col: token.col,
        };
    }
    return lastTokenPos !== undefined ? lastTokenPos : startPos;
}

exports.linePositions = linePositions;
exports.shiftToTokenStart = shiftToTokenStart;


/***/ }),
/* 10 */
/***/ (function(module, exports) {


const timeoutMs = 10 * 1000;

const workerScript = (function(){
    function sandboxScript(script) {
        const illegalChars = `\`[]."'{}+-*`;
        const lookUp = new RegExp(
            `[${illegalChars.split('').map(v => `\\${v}`).join('')}]`
        , 'g');

        if (lookUp.test(script)) {
            throw new Error(`script contains illegal characters: ${illegalChars}`);
        }

        return `
            with (trap) {
                return (${script});
            }
        `;
    }

    function churchNumerialToNumber(cn) {
        return cn(acc => acc + 1)(0);
    }

    self.onmessage=function(event) {
        const trap = new Proxy({}, {
            has: () => true,
            get: () => (f => x => x)
        });
        const functionBody = sandboxScript(event.data);
        const program = new Function('trap', functionBody);
        const result = program(trap);
        postMessage({
            result: result.toString(),
            number: churchNumerialToNumber(result)
        });
    };
}).toString().slice('function() {'.length, -1);

function evaluateScript(script) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('data:application/javascript,' +
                        encodeURIComponent(workerScript));
        const timerId = setTimeout(() => {
            reject(new Error('worker timeout'));
            worker.terminate();
        }, timeoutMs);

        worker.onmessage = function(e) {
            resolve(e.data);
            worker.terminate();
            clearTimeout(timerId);
        };
        worker.postMessage(script);
    });
}

exports.evaluateScript = evaluateScript;


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMWRlZWM0Y2E3OTNjOTE2ZTE2OWEiLCJ3ZWJwYWNrOi8vLy4uL2xjL2V4cHJlc3Npb25zLmpzIiwid2VicGFjazovLy8uLi9sYy9zY2FubmVyLmpzIiwid2VicGFjazovLy8uLi9sYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi4vbGMvcGVla0l0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uLi9sYy9lcnJvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uLi9sYy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4uL2xjL2pzVHJhbnNwaWxlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanNIaWdobGlnaHRUcmFuc3BpbGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9saW5lUG9zaXRpb25zLmpzIiwid2VicGFjazovLy8uL3NyYy9vdXRwdXRFdmFsdWF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDN0RBO0FBQ0E7O0FBRUEsT0FBTyxNQUFNOztBQUViO0FBQ0E7QUFDQSxlQUFlLGtCQUFrQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxlQUFlLElBQUk7QUFDbkI7QUFD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QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxRQUFRO0FBQ25CLGFBQWE7QUFDYjtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7OztBQ2pGQTs7QUFFQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0EsZ0JBQWdCLHFDQUFxQyxFQUFFLFlBQVk7QUFDbkU7O0FBRUE7QUFDQSxtRUFBbUUsYUFBYTtBQUNoRjs7QUFFQTtBQUNBO0FBQ0EsMEJBQTBCLE9BQU87QUFDakM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLENBQUMsZ0NBQWdDOztBQUVqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDFkZWVjNGNhNzkzYzkxNmUxNjlhIiwiLy8gQHRzLWNoZWNrXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9leHByZXNzaW9ucy5kLnRzXCIgLz5cblxuY29uc3Qge1Rva2VufSA9IHJlcXVpcmUoJy4vc2Nhbm5lcicpO1xuXG5jbGFzcyBFeHByZXNzaW9uIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0V4cHJlc3Npb25WaXNpdG9yfSB2aXNpdG9yXG4gICAgICovXG4gICAgYWNjZXB0KHZpc2l0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuZW1wdHkoKTtcbiAgICB9XG59XG5cbmNsYXNzIEV4cHJlc3Npb25WaXNpdG9yIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge2FueX0gZW1wdHkgOiBUXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZW1wdHkpIHtcbiAgICAgICAgdGhpcy5lID0gZW1wdHk7XG4gICAgfVxuICAgIGVtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1ZhcmlhYmxlRXhwcmVzc2lvbn0gdmVcbiAgICAgKi9cbiAgICB2aXNpdFZhcmlhYmxlKHZlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb25FeHByZXNzaW9ufSBmZVxuICAgICAqL1xuICAgIHZpc2l0RnVuY3Rpb24oZmUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtBcHBseUV4cHJlc3Npb259IGFlXG4gICAgICovXG4gICAgdmlzaXRBcHBsaWNhdGlvbihhZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5lO1xuICAgIH1cbn1cblxuY2xhc3MgVmFyaWFibGVFeHByZXNzaW9uIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtUb2tlbn0gaWRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpZCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFeHByZXNzaW9uVmlzaXRvcn0gdmlzaXRvclxuICAgICAqL1xuICAgIGFjY2VwdCh2aXNpdG9yKSB7XG4gICAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VmFyaWFibGUodGhpcyk7XG4gICAgfVxufVxuXG5jbGFzcyBGdW5jdGlvbkV4cHJlc3Npb24gZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgICAgLyoqXG4gICAgICogQHBhcmFtIHtUb2tlbn0gcGFyYW1JZFxuICAgICAqIEBwYXJhbSB7RXhwcmVzc2lvbn0gYm9keVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtSWQsIGJvZHkpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5wYXJhbUlkID0gcGFyYW1JZDtcbiAgICAgICAgdGhpcy5ib2R5ID0gYm9keTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0V4cHJlc3Npb25WaXNpdG9yfSB2aXNpdG9yXG4gICAgICovXG4gICAgYWNjZXB0KHZpc2l0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRGdW5jdGlvbih0aGlzKTtcbiAgICB9XG59XG5cbmNsYXNzIEFwcGx5RXhwcmVzc2lvbiBleHRlbmRzIEV4cHJlc3Npb24ge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RXhwcmVzc2lvbn0gbGVmdFxuICAgICAqIEBwYXJhbSB7RXhwcmVzc2lvbn0gcmlnaHRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsZWZ0LCByaWdodCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtFeHByZXNzaW9uVmlzaXRvcn0gdmlzaXRvclxuICAgICAqL1xuICAgIGFjY2VwdCh2aXNpdG9yKSB7XG4gICAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QXBwbGljYXRpb24odGhpcyk7XG4gICAgfVxufVxuXG5leHBvcnRzLkV4cHJlc3Npb24gPSBFeHByZXNzaW9uO1xuZXhwb3J0cy5FeHByZXNzaW9uVmlzaXRvciA9IEV4cHJlc3Npb25WaXNpdG9yO1xuZXhwb3J0cy5WYXJpYWJsZUV4cHJlc3Npb24gPSBWYXJpYWJsZUV4cHJlc3Npb247XG5leHBvcnRzLkZ1bmN0aW9uRXhwcmVzc2lvbiA9IEZ1bmN0aW9uRXhwcmVzc2lvbjtcbmV4cG9ydHMuQXBwbHlFeHByZXNzaW9uID0gQXBwbHlFeHByZXNzaW9uO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi4vbGMvZXhwcmVzc2lvbnMuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gQHRzLWNoZWNrXG5cbmNvbnN0IFBlZWtJdGVyYXRvciA9IHJlcXVpcmUoJy4vcGVla0l0ZXJhdG9yJykuUGVla0l0ZXJhdG9yO1xuY29uc3Qge0NvbXBpbGVyRXJyb3J9ID0gcmVxdWlyZSgnLi9lcnJvcnMnKTtcblxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGNoYXIpIHtcbiAgICByZXR1cm4gL1xccy8udGVzdChjaGFyKTtcbn1cblxuY2xhc3MgRmlsZUl0ZXJhdG9yIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SXRlcmF0b3I8c3RyaW5nPn0gW3NyY0l0ZXJhdG9yXSAtIEl0ZXJhdG9yIGZvciBzb3VyY2UgZmlsZVxuICAgICovXG4gICAgY29uc3RydWN0b3Ioc3JjSXRlcmF0b3IpIHtcbiAgICAgICAgLyoqIEB0eXBle2lQZWVrSXRlcmF0b3I8c3RyaW5nPn0gKi9cbiAgICAgICAgdGhpcy5wZWVrSXRlcmF0b3IgPSBuZXcgUGVla0l0ZXJhdG9yKHNyY0l0ZXJhdG9yKTtcbiAgICAgICAgdGhpcy5saW5lID0gMTtcbiAgICAgICAgdGhpcy5jb2wgPSAwO1xuICAgIH1cblxuICAgIGFkdmFuY2UoKSB7XG4gICAgICAgIGlmICh0aGlzLnBlZWtJdGVyYXRvci5jdXJyZW50UG9zICE9PSB2b2lkIDBcbiAgICAgICAgICAgICYmIHRoaXMucGVla0l0ZXJhdG9yLmN1cnJlbnRQb3MudmFsdWUgPT09ICdcXG4nXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5saW5lKys7XG4gICAgICAgICAgICB0aGlzLmNvbCA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbCsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBlZWtJdGVyYXRvci5hZHZhbmNlKCk7XG4gICAgfVxuXG4gICAgcGVlaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVla0l0ZXJhdG9yLnBlZWsoKTtcbiAgICB9XG5cbiAgICBkb25lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wZWVrSXRlcmF0b3IuZG9uZSgpO1xuICAgIH1cbn1cblxuY2xhc3MgVG9rZW4ge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbmVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29sXG4gICAgICogQHBhcmFtIHtzdHJpbmc/fSB2YWx1ZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHR5cGUsIGxpbmUsIGNvbCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5saW5lID0gbGluZTtcbiAgICAgICAgdGhpcy5jb2wgPSBjb2w7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBpbnNwZWN0KCkge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnVkFSJykge1xuICAgICAgICAgICAgcmV0dXJuIGBAJHt0aGlzLnZhbHVlfWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpO1xuICAgIH1cbn1cblxuY29uc3QgVG9rZW5zID0ge1xuICAgIExhbWJkYTogICAgICAgICdMQU1CJyxcbiAgICBEb3Q6ICAgICAgICAgICAnRE9UJyxcbiAgICBCcmFja2V0T3BlbjogICAnKCcsXG4gICAgQnJhY2tldENsb3NlOiAgJyknLFxuICAgIFZhcjogICAgICAgICAgICdWQVInLFxuICAgIExpdGVyYWw6ICAgICAgICdMSVQnLFxuICAgIExldDogICAgICAgICAgICdMRVQnLFxuICAgIEVxdWFsOiAgICAgICAgICdFUVVBTCcsXG4gICAgSW46ICAgICAgICAgICAgJ0lOJyxcbiAgICBDb21tYTogICAgICAgICAnLCcsXG4gICAgRU9GOiAgICAgICAgICAgJ0VPRidcbn07XG5cblRva2VuLkxhbWJkYSAgICAgICA9ICh7bGluZSwgY29sfSkgPT4gbmV3IFRva2VuKFRva2Vucy5MYW1iZGEsIGxpbmUsIGNvbCwgdm9pZCAwKTtcblRva2VuLkRvdCAgICAgICAgICA9ICh7bGluZSwgY29sfSkgPT4gbmV3IFRva2VuKFRva2Vucy5Eb3QsIGxpbmUsIGNvbCwgdm9pZCAwKTtcblRva2VuLkJyYWNrZXRPcGVuICA9ICh7bGluZSwgY29sfSkgPT4gbmV3IFRva2VuKFRva2Vucy5CcmFja2V0T3BlbiwgbGluZSwgY29sLCB2b2lkIDApO1xuVG9rZW4uQnJhY2tldENsb3NlID0gKHtsaW5lLCBjb2x9KSA9PiBuZXcgVG9rZW4oVG9rZW5zLkJyYWNrZXRDbG9zZSwgbGluZSwgY29sLCB2b2lkIDApO1xuVG9rZW4uRU9GICAgICAgICAgID0gKHtsaW5lLCBjb2x9KSA9PiBuZXcgVG9rZW4oVG9rZW5zLkVPRiwgbGluZSwgY29sLCB2b2lkIDApO1xuVG9rZW4uTGV0ICAgICAgICAgID0gKHtsaW5lLCBjb2x9KSA9PiBuZXcgVG9rZW4oVG9rZW5zLkxldCwgbGluZSwgY29sLCB2b2lkIDApO1xuVG9rZW4uRXF1YWwgICAgICAgID0gKHtsaW5lLCBjb2x9KSA9PiBuZXcgVG9rZW4oVG9rZW5zLkVxdWFsLCBsaW5lLCBjb2wsIHZvaWQgMCk7XG5Ub2tlbi5JbiAgICAgICAgICAgPSAoe2xpbmUsIGNvbH0pID0+IG5ldyBUb2tlbihUb2tlbnMuSW4sIGxpbmUsIGNvbCwgdm9pZCAwKTtcblRva2VuLkNvbW1hICAgICAgICA9ICh7bGluZSwgY29sfSkgPT4gbmV3IFRva2VuKFRva2Vucy5Db21tYSwgbGluZSwgY29sLCB2b2lkIDApO1xuVG9rZW4uVmFyaWFibGUgICAgID0gKHtsaW5lLCBjb2x9LCBuYW1lKSA9PiBuZXcgVG9rZW4oVG9rZW5zLlZhciwgbGluZSwgY29sLCBuYW1lKTtcblRva2VuLkxpdGVyYWwgICAgICA9ICh7bGluZSwgY29sfSwgdGV4dCkgPT4gbmV3IFRva2VuKFRva2Vucy5MaXRlcmFsLCBsaW5lLCBjb2wsIHRleHQpO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0clxuICogQHJldHVybnMge0l0ZXJhYmxlSXRlcmF0b3I8VG9rZW4+fVxuICovXG5mdW5jdGlvbiogc2NhbihpbnB1dFN0cikge1xuICAgIGNvbnN0IGl0ID0gbmV3IEZpbGVJdGVyYXRvcihpbnB1dFN0cltTeW1ib2wuaXRlcmF0b3JdKCkpO1xuXG4gICAgZm9yICg7Oykge1xuICAgICAgICBjb25zdCBjaGFyID0gaXQuYWR2YW5jZSgpO1xuICAgICAgICBpZiAoaXQuZG9uZSgpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1doaXRlc3BhY2UoY2hhcikpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKC9bYS16X10vaS50ZXN0KGNoYXIpKSB7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSB7IGxpbmU6IGl0LmxpbmUsIGNvbDogaXQuY29sIH07XG4gICAgICAgICAgICBjb25zdCBzdHIgPSBjaGFyICsgY29uc3VtZSgvW2EtejAtOV9dL2ksIGl0KTtcbiAgICAgICAgICAgIHN3aXRjaCAoc3RyKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGV0JzpcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgVG9rZW4uTGV0KHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luJzpcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgVG9rZW4uSW4ocG9zKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgVG9rZW4uVmFyaWFibGUocG9zLCBzdHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoL1swLTldLy50ZXN0KGNoYXIpKSB7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSB7IGxpbmU6IGl0LmxpbmUsIGNvbDogaXQuY29sIH07XG4gICAgICAgICAgICBjb25zdCBudW0gPSBjaGFyICsgY29uc3VtZSgvWzAtOV9dLywgaXQpLnJlcGxhY2UoL1tfXS9nLCAnJyk7XG4gICAgICAgICAgICB5aWVsZCBUb2tlbi5MaXRlcmFsKHBvcywgbnVtKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChjaGFyKSB7XG4gICAgICAgICAgICBjYXNlICcoJzpcbiAgICAgICAgICAgICAgICB5aWVsZCBUb2tlbi5CcmFja2V0T3BlbihpdCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjYXNlICcpJzpcbiAgICAgICAgICAgICAgICB5aWVsZCBUb2tlbi5CcmFja2V0Q2xvc2UoaXQpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgY2FzZSAnzrsnOlxuICAgICAgICAgICAgY2FzZSAnXFxcXCc6XG4gICAgICAgICAgICAgICAgeWllbGQgVG9rZW4uTGFtYmRhKGl0KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgICAgICAgIHlpZWxkIFRva2VuLkRvdChpdCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICAgICAgICB5aWVsZCBUb2tlbi5Db21tYShpdCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgICAgICB5aWVsZCBUb2tlbi5FcXVhbChpdCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBDb21waWxlckVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgdW5leHBlY3RlZCB0b2tlbiAnJHtjaGFyfSdgLFxuICAgICAgICAgICAgICAgICAgICBpdFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB5aWVsZCBUb2tlbi5FT0YoaXQpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7UmVnRXhwfSBwYXR0ZXJuXG4gKiBAcGFyYW0ge0ZpbGVJdGVyYXRvcn0gaXRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGNvbnN1bWUocGF0dGVybiwgaXQpIHtcbiAgICBsZXQgcmV0VmFsID0gJyc7XG4gICAgZm9yICg7Oykge1xuICAgICAgICBpZiAoISBwYXR0ZXJuLnRlc3QoaXQucGVlaygpKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0VmFsICs9IGl0LmFkdmFuY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldFZhbDtcbn1cblxuZXhwb3J0cy5zY2FuID0gc2NhbjtcbmV4cG9ydHMuVG9rZW4gPSBUb2tlbjtcbmV4cG9ydHMuVG9rZW5zID0gVG9rZW5zO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi4vbGMvc2Nhbm5lci5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBAdHMtY2hlY2tcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cHJlc3Npb25zLmQudHNcIiAvPlxuXG5jb25zdCB7c2Nhbn0gPSByZXF1aXJlKCcuL3NjYW5uZXInKTtcbmNvbnN0IHtwYXJzZX0gPSByZXF1aXJlKCcuL3BhcnNlcicpO1xuY29uc3Qge0V4cHJlc3Npb259ID0gcmVxdWlyZSgnLi9leHByZXNzaW9ucycpO1xuY29uc3Qge0phdmFzY3JpcHRWaXNpdG9yfSA9IHJlcXVpcmUoJy4vanNUcmFuc3BpbGVyJyk7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHJldHVybnMge0V4cHJlc3Npb259XG4gKi9cbmZ1bmN0aW9uIGZyb250ZW5kKHN0cikge1xuICAgIGNvbnN0IHRva2VucyA9IHNjYW4oc3RyKTtcbiAgICByZXR1cm4gcGFyc2UodG9rZW5zKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjb21waWxlVG9KcyhzdHIpIHtcbiAgICBjb25zdCBwcm9ncmFtID0gZnJvbnRlbmQoc3RyKTtcbiAgICBjb25zdCB2aXNpdG9yID0gbmV3IEphdmFzY3JpcHRWaXNpdG9yKCk7XG4gICAgcmV0dXJuIHByb2dyYW0uYWNjZXB0KHZpc2l0b3IpO1xufVxuXG5leHBvcnRzLnNjYW4gPSBzY2FuO1xuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuZXhwb3J0cy5mcm9udGVuZCA9IGZyb250ZW5kO1xuZXhwb3J0cy5jb21waWxlVG9KcyA9IGNvbXBpbGVUb0pzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi4vbGMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gQHRzLWNoZWNrXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9wZWVrSXRlcmF0b3JJbnRlcmZhY2UuZC50c1wiIC8+XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBpbXBsZW1lbnRzIHtpUGVla0l0ZXJhdG9yPFQ+fVxuICovXG5jbGFzcyBQZWVrSXRlcmF0b3Ige1xuXG4gICAgLyoqXG4gICAgICogQHRlbXBsYXRlIFRcbiAgICAgKiBAcGFyYW0ge0l0ZXJhdG9yPFQ+fSBbc3JjSXRlcmF0b3JdIC0gSXRlcmF0b3IgYmVpbmcgd3JhcHBlZFxuICAgICAqIEByZXR1cm5zIHtpUGVla0l0ZXJhdG9yPFQ+fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNyY0l0ZXJhdG9yKSB7XG4gICAgICAgIHRoaXMuaXRlcmF0b3IgPSBzcmNJdGVyYXRvcjtcbiAgICAgICAgLyoqIEB0eXBle0l0ZXJhdG9yUmVzdWx0PFQ+fSAqL1xuICAgICAgICB0aGlzLmN1cnJlbnRQb3MgPSB2b2lkIDA7XG4gICAgICAgIHRoaXMuaW5kZXggPSAtMTtcbiAgICAgICAgLyoqIEB0eXBle01hcDxudW1iZXIsIEl0ZXJhdG9yUmVzdWx0PFQ+Pn0gKi9cbiAgICAgICAgdGhpcy5wZWVrQ2FjaGUgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgYWR2YW5jZSgpIHtcbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5wZWVrQ2FjaGUuZ2V0KHRoaXMuaW5kZXgpO1xuICAgICAgICBpZiAocG9zICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHRoaXMucGVla0NhY2hlLmRlbGV0ZSh0aGlzLmluZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudFBvcyA9IHBvcztcbiAgICAgICAgcmV0dXJuIHRoaXMuX19pdFZhbHVlKHBvcyk7XG4gICAgfVxuXG4gICAgcGVlayhpID0gMSkge1xuICAgICAgICBpZiAoaSA8IDEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncGVlayBkaXN0YW5jZSBtdXN0IGJlID49IDEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5leHRJbmRleCA9IHRoaXMuaW5kZXggKyBpO1xuICAgICAgICBjb25zdCBwZWVrUG9zID0gdGhpcy5wZWVrQ2FjaGUuZ2V0KG5leHRJbmRleCk7XG4gICAgICAgIGlmIChwZWVrUG9zICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9faXRWYWx1ZShwZWVrUG9zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMucGVlayhpIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbiA9IHRoaXMuaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICB0aGlzLnBlZWtDYWNoZS5zZXQobmV4dEluZGV4LCBuKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19pdFZhbHVlKG4pO1xuICAgIH1cblxuICAgIGRvbmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQb3MgIT09IHZvaWQgMCAmJiB0aGlzLmN1cnJlbnRQb3MuZG9uZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAdGVtcGxhdGUgVFxuICAgICAqIEBwYXJhbSB7SXRlcmF0b3JSZXN1bHQ8VD59IGkgXG4gICAgICovXG4gICAgX19pdFZhbHVlKGkpIHtcbiAgICAgICAgaWYgKGkuZG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuICdcXDAnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGkudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuUGVla0l0ZXJhdG9yID0gUGVla0l0ZXJhdG9yO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi4vbGMvcGVla0l0ZXJhdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIEB0cy1jaGVja1xuXG5jbGFzcyBDb21waWxlckVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1zZ1xuICAgICAqIEBwYXJhbSB7e2xpbmU6IG51bWJlciwgY29sOiBudW1iZXJ9fSBwb3NcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihtc2csIHBvcykge1xuICAgICAgICBzdXBlcihtc2cpO1xuICAgICAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICAgICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIENvbXBpbGVyRXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHVzZXJNZXNzYWdlKHNyYykge1xuICAgICAgICBjb25zdCB7bGluZSwgY29sfSA9IHRoaXMucG9zO1xuICAgICAgICBjb25zdCBzdHIgPSBzcmMuc3BsaXQoJ1xcbicpW2xpbmUgLSAxXTtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heCgwLCBjb2wgLSA3KTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGAke3RoaXMubWVzc2FnZX1gLFxuICAgICAgICAgICAgYCR7c3RyLnN1YnN0cihzdGFydCwgMTQpfWAsXG4gICAgICAgICAgICAvLyBgJHsnJy5wYWRTdGFydChwYWRkaW5nLCAnICcpfV5gXG4gICAgICAgICAgICBgJHtgYC5wYWRTdGFydChjb2wgLSBzdGFydCAtIDEsICcgJyl9XmBcbiAgICAgICAgXS5qb2luKCdcXG4nKTtcbiAgICB9XG59XG5cbmV4cG9ydHMuQ29tcGlsZXJFcnJvciA9IENvbXBpbGVyRXJyb3I7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuLi9sYy9lcnJvcnMuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY29uc3QgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQnKTtcbmNvbnN0IG91dHB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXQnKTtcbmNvbnN0IGV2YWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXZhbC1vdXRwdXQnKTtcbmNvbnN0IHtmcm9udGVuZH0gPSByZXF1aXJlKCcuLi8uLi9sYycpO1xuY29uc3QgSnNIaWdobGlnaHRlciA9IHJlcXVpcmUoJy4vanNIaWdobGlnaHRUcmFuc3BpbGVyJykuanNIaWdobGlnaHRUcmFuc3BpbGVyO1xuY29uc3Qge2xpbmVQb3NpdGlvbnMsIHNoaWZ0VG9Ub2tlblN0YXJ0fSA9IHJlcXVpcmUoJy4vbGluZVBvc2l0aW9ucycpO1xuY29uc3Qge2V2YWx1YXRlU2NyaXB0fSA9IHJlcXVpcmUoJy4vb3V0cHV0RXZhbHVhdG9yJyk7XG5cbmZ1bmN0aW9uIGNvbXBpbGVXaXRoSGlnaGxpZ2h0KGlucHV0LCBzdGFydCwgZW5kKSB7XG4gICAgY29uc3QgcHJvZ3JhbSA9IGZyb250ZW5kKGlucHV0KTtcbiAgICBjb25zdCBzaGlmdGVkU3RhcnQgPSBzaGlmdFRvVG9rZW5TdGFydChpbnB1dCwgc3RhcnQpO1xuICAgIHJldHVybiBwcm9ncmFtLmFjY2VwdChuZXcgSnNIaWdobGlnaHRlcihzaGlmdGVkU3RhcnQsIGVuZCkpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzSW5wdXQoKSB7XG4gICAgY29uc3QgaW5TdHIgPSBpbnB1dC52YWx1ZTtcbiAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSBsaW5lUG9zaXRpb25zKGluU3RyLCBpbnB1dC5zZWxlY3Rpb25TdGFydCwgaW5wdXQuc2VsZWN0aW9uRW5kKTtcblxuICAgIHRyeSB7XG4gICAgICAgIG91dHB1dC5pbm5lckhUTUwgPSBjb21waWxlV2l0aEhpZ2hsaWdodChpblN0ciwgc3RhcnQsIGVuZCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZSAmJiBlLnVzZXJNZXNzYWdlKSB7XG4gICAgICAgICAgICBvdXRwdXQuaW5uZXJUZXh0ID0gZS51c2VyTWVzc2FnZShpbnB1dC52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgb3V0cHV0LmlubmVyVGV4dCA9IGAhIFVuZXhwZWN0ZWQgZXJyb3JgO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5pbnB1dC5vbmtleXVwID0gcHJvY2Vzc0lucHV0O1xuaW5wdXQub25jaGFuZ2UgPSBwcm9jZXNzSW5wdXQ7XG5kb2N1bWVudC5vbnNlbGVjdGlvbmNoYW5nZSA9IHByb2Nlc3NJbnB1dDtcbndpbmRvdy5vbnNlbGVjdGlvbmNoYW5nZSA9IHByb2Nlc3NJbnB1dDtcblxuZXZhbEJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIGV2YWx1YXRlU2NyaXB0KG91dHB1dC5pbm5lclRleHQpLnRoZW4oY29uc29sZS5sb2csIGNvbnNvbGUuZXJyb3IpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIEB0cy1jaGVja1xuXG5jb25zdCB7IFRva2VuLCBUb2tlbnMgfSA9IHJlcXVpcmUoJy4vc2Nhbm5lcicpO1xuY29uc3QgeyBQZWVrSXRlcmF0b3IgfSA9IHJlcXVpcmUoJy4vcGVla0l0ZXJhdG9yJyk7XG5jb25zdCB7IENvbXBpbGVyRXJyb3IgfSA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XG5jb25zdCB7XG4gICAgRXhwcmVzc2lvbiwgVmFyaWFibGVFeHByZXNzaW9uLCBGdW5jdGlvbkV4cHJlc3Npb24sIEFwcGx5RXhwcmVzc2lvblxuICAgIH0gPSByZXF1aXJlKCcuL2V4cHJlc3Npb25zJyk7XG5jb25zdCB7XG4gICAgQnJhY2tldE9wZW4sIEJyYWNrZXRDbG9zZSwgTGFtYmRhLCBEb3QsXG4gICAgVmFyLCBMaXRlcmFsLCBMZXQsIEVxdWFsLCBJbiwgQ29tbWEsIEVPRlxuICAgIH0gPSBUb2tlbnM7XG5cbi8qKlxuICogcHJvZ3JhbSAtPiBleHByZXNzaW9uIEVPRiAuXG4gKiBleHByZXNzaW9uIC0+IGFwcGx5IC5cbiAqIGFwcGx5IC0+IGxhbWIgbGFtYiogLlxuICogbGFtYiAtPiBgzrtgIFZBUiBgLmAgYXBwbHkgLlxuICogbGFtYiAtPiBwcmltYXJ5IC5cbiAqIHByaW1hcnkgLT4gYChgIGV4cHJlc3Npb24gYClgIC5cbiAqIHByaW1hcnkgLT4gYGxldGAgVkFSIGA9YCBleHByZXNzaW9uIChgLGAgVkFSIGA9YCBleHByZXNzaW9uKSogYGluYCBleHByZXNzaW9uIC5cbiAqIHByaW1hcnkgLT4gVkFSIC5cbiAqIHByaW1hcnkgLT4gTElULlxuICovXG5cbi8qKlxuICogcHJvZ3JhbSAtPiBleHByZXNzaW9uIEVPRiAuXG4gKiBAcGFyYW0ge2lQZWVrSXRlcmF0b3I8VG9rZW4+fSBpdFxuICogQHJldHVybnMge0V4cHJlc3Npb259XG4gKi9cbmZ1bmN0aW9uIHByb2dyYW0oaXQpIHtcbiAgICBjb25zdCBlID0gZXhwcmVzc2lvbihpdCk7XG4gICAgZXhwZWN0KEVPRiwgaXQuYWR2YW5jZSgpKTtcbiAgICByZXR1cm4gZTtcbn1cblxuLyoqXG4gKiBleHByZXNzaW9uIC0+IGFwcGx5IC5cbiAqIEBwYXJhbSB7aVBlZWtJdGVyYXRvcjxUb2tlbj59IGl0XG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvbn1cbiAqL1xuZnVuY3Rpb24gZXhwcmVzc2lvbihpdCkge1xuICAgIHJldHVybiBhcHBseShpdCk7XG59XG5cbi8qKlxuICogYXBwbHkgLT4gbGFtYiBsYW1iKiAuXG4gKiBAcGFyYW0ge2lQZWVrSXRlcmF0b3I8VG9rZW4+fSBpdFxuICogQHJldHVybnMge0V4cHJlc3Npb259XG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGl0KSB7XG4gICAgbGV0IGV4cCA9IGxhbWIoaXQpO1xuICAgIGdyZWVkeTogZm9yICg7Oykge1xuICAgICAgICBjb25zdCBwID0gaXQucGVlaygpO1xuICAgICAgICBzd2l0Y2ggKHAudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBCcmFja2V0T3BlbjpcbiAgICAgICAgICAgIGNhc2UgTGFtYmRhOlxuICAgICAgICAgICAgY2FzZSBWYXI6XG4gICAgICAgICAgICBjYXNlIExpdGVyYWw6XG4gICAgICAgICAgICAgICAgY29uc3QgcmlnaHQgPSBsYW1iKGl0KTtcbiAgICAgICAgICAgICAgICBleHAgPSBuZXcgQXBwbHlFeHByZXNzaW9uKGV4cCwgcmlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhayBncmVlZHk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4cDtcbn1cblxuLyoqXG4gKiBsYW1iIC0+IGDOu2AgVkFSIGAuYCBhcHBseSAuXG4gKiBsYW1iIC0+IHBybWFyeSAuXG4gKiBAcGFyYW0ge2lQZWVrSXRlcmF0b3I8VG9rZW4+fSBpdFxuICogQHJldHVybnMge0V4cHJlc3Npb259XG4gKi9cbmZ1bmN0aW9uIGxhbWIoaXQpIHtcbiAgICBpZiAodGVzdChMYW1iZGEsIGl0LnBlZWsoKSkpIHtcbiAgICAgICAgaXQuYWR2YW5jZSgpO1xuICAgICAgICBjb25zdCBpZCA9IGV4cGVjdChWYXIsIGl0LmFkdmFuY2UoKSk7XG4gICAgICAgIGV4cGVjdChEb3QsIGl0LmFkdmFuY2UoKSk7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBhcHBseShpdCk7XG4gICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBib2R5KTtcbiAgICB9XG4gICAgcmV0dXJuIHByaW1hcnkoaXQpO1xufVxuXG4vKipcbiAqIHByaW1hcnkgLT4gJygnIGV4cHJlc3Npb24gJyknIC5cbiAqIHByaW1hcnkgLT4gYGxldGAgVkFSIGA9YCBleHByZXNzaW9uIChgLGAgVkFSIGA9YCBleHByZXNzaW9uKSogYGluYCBleHByZXNzaW9uIC5cbiAqIHByaW1hcnkgLT4gVkFSIC5cbiAqIHByaW1hcnkgLT4gTElUIC5cbiAqIEBwYXJhbSB7aVBlZWtJdGVyYXRvcjxUb2tlbj59IGl0XG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvbn1cbiAqL1xuZnVuY3Rpb24gcHJpbWFyeShpdCkge1xuICAgIGlmICh0ZXN0KEJyYWNrZXRPcGVuLCBpdC5wZWVrKCkpKSB7XG4gICAgICAgIGl0LmFkdmFuY2UoKTtcbiAgICAgICAgY29uc3QgZSA9IGV4cHJlc3Npb24oaXQpO1xuICAgICAgICBleHBlY3QoQnJhY2tldENsb3NlLCBpdC5hZHZhbmNlKCkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9XG4gICAgaWYgKHRlc3QoTGV0LCBpdC5wZWVrKCkpKSB7XG4gICAgICAgIHJldHVybiBsZXRFeHByZXNzaW9uKGl0KTtcbiAgICB9XG4gICAgaWYgKHRlc3QoVmFyLCBpdC5wZWVrKCkpKSB7XG4gICAgICAgIGNvbnN0IGlkID0gaXQuYWR2YW5jZSgpO1xuICAgICAgICByZXR1cm4gbmV3IFZhcmlhYmxlRXhwcmVzc2lvbihpZCk7XG4gICAgfVxuICAgIGNvbnN0IGxpdGVyYWwgPSBleHBlY3QoTGl0ZXJhbCwgaXQuYWR2YW5jZSgpKTtcbiAgICByZXR1cm4gY2h1cmNoX251bWVyYWwoTnVtYmVyLnBhcnNlSW50KGxpdGVyYWwudmFsdWUsIDEwKSwgbGl0ZXJhbCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtJdGVyYXRvcjxUb2tlbj59IHRva2Vuc1xuICogQHJldHVybnMge0V4cHJlc3Npb259XG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHRva2Vucykge1xuICAgIC8qKiBAdHlwZXtpUGVla0l0ZXJhdG9yPFRva2VuPn0gKi9cbiAgICBjb25zdCBpdCA9IG5ldyBQZWVrSXRlcmF0b3IodG9rZW5zKTtcbiAgICByZXR1cm4gcHJvZ3JhbShpdCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGV4cGVjdGVkVHlwZVxuICogQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiAqIEB0aHJvd3Mge0Vycm9yfVxuICovXG5mdW5jdGlvbiBleHBlY3QoZXhwZWN0ZWRUeXBlLCB0b2tlbikge1xuICAgIGlmIChleHBlY3RlZFR5cGUgIT09IHRva2VuLnR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbXBpbGVyRXJyb3IoXG4gICAgICAgICAgICBgRXhwZWN0ZWQgJHtleHBlY3RlZFR5cGV9IGJ1dCBzYXcgJHt0b2tlbi50eXBlfWAsXG4gICAgICAgICAgICB0b2tlblxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGV4cGVjdGVkVHlwZVxuICogQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiB0ZXN0KGV4cGVjdGVkVHlwZSwgdG9rZW4pIHtcbiAgICByZXR1cm4gZXhwZWN0ZWRUeXBlID09PSB0b2tlbi50eXBlO1xufVxuXG4vKipcbiAqIERlLXN1Z2FycyBhIG51bWJlciBpbnRvIGEgY2h1cmNoIG51bWVyaWFsXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAqIEBwYXJhbSB7e2xpbmU6IG51bWJlciwgY29sOiBudW1iZXJ9fSBwb3NcbiAqIEByZXR1cm5zIHtFeHByZXNzaW9ufVxuICovXG5mdW5jdGlvbiBjaHVyY2hfbnVtZXJhbCh2YWx1ZSwgcG9zKSB7XG4gICAgY29uc3QgZlZhciA9IFRva2VuLlZhcmlhYmxlKHBvcywgJ2YnKTtcbiAgICBjb25zdCB4VmFyID0gVG9rZW4uVmFyaWFibGUocG9zLCAneCcpO1xuICAgIGNvbnN0IGYgPSBuZXcgVmFyaWFibGVFeHByZXNzaW9uKGZWYXIpO1xuICAgIGNvbnN0IHggPSBuZXcgVmFyaWFibGVFeHByZXNzaW9uKHhWYXIpO1xuXG4gICAgY29uc3QgYm9keSA9IEFycmF5LmZyb20oe2xlbmd0aDogdmFsdWV9KVxuICAgICAgICAucmVkdWNlKGV4cHJlc3Npb24gPT4gbmV3IEFwcGx5RXhwcmVzc2lvbihmLCBleHByZXNzaW9uKSwgeCk7XG5cbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uRXhwcmVzc2lvbihmVmFyLCBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKHhWYXIsIGJvZHkpKTtcbn1cblxuLyoqXG4gKiBEZS1zdWdhcnMgYSBsZXQgZXhwcmVzc3Npb24gaW50byBmdW5jdGlvbiBhcHBsaWNhdGlvblxuICogYGxldGAgVkFSIGA9YCBleHByZXNzaW9uIChgLGAgVkFSIGA9YCBleHByZXNzaW9uKSogYGluYCBleHByZXNzaW9uXG4gKiBAcGFyYW0ge2lQZWVrSXRlcmF0b3I8VG9rZW4+fSBpdFxuICogQHJldHVybnMge0V4cHJlc3Npb259XG4gKi9cbmZ1bmN0aW9uIGxldEV4cHJlc3Npb24oaXQpIHtcbiAgICBleHBlY3QoTGV0LCBpdC5hZHZhbmNlKCkpO1xuICAgIGNvbnN0IGJpbmRpbmdzID0gW107XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgaWQgPSBleHBlY3QoVmFyLCBpdC5hZHZhbmNlKCkpO1xuICAgICAgICBleHBlY3QoRXF1YWwsIGl0LmFkdmFuY2UoKSk7XG4gICAgICAgIGNvbnN0IHZhbCA9IGV4cHJlc3Npb24oaXQpO1xuICAgICAgICBiaW5kaW5ncy5wdXNoKHtpZCwgdmFsfSk7XG4gICAgICAgIGlmICh0ZXN0KENvbW1hLCBpdC5wZWVrKCkpKSB7XG4gICAgICAgICAgICBpdC5hZHZhbmNlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBlY3QoSW4sIGl0LmFkdmFuY2UoKSk7XG4gICAgY29uc3QgZXhwID0gZXhwcmVzc2lvbihpdCk7XG4gICAgY29uc3QgY3VycmllZCA9IGJpbmRpbmdzLnJlZHVjZVJpZ2h0KFxuICAgICAgICAoYWNjLCB7aWR9KSA9PiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKGlkLCBhY2MpLCBleHBcbiAgICApO1xuICAgIHJldHVybiBiaW5kaW5ncy5yZWR1Y2UoXG4gICAgICAgIChhY2MsIHt2YWx9KSA9PiBuZXcgQXBwbHlFeHByZXNzaW9uKGFjYywgdmFsKSwgY3VycmllZFxuICAgICk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL2xjL3BhcnNlci5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBAdHMtY2hlY2tcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2V4cHJlc3Npb25zLmQudHNcIiAvPlxuXG5jb25zdCB7XG4gICAgRXhwcmVzc2lvblZpc2l0b3IsXG4gICAgVmFyaWFibGVFeHByZXNzaW9uLFxuICAgIEZ1bmN0aW9uRXhwcmVzc2lvbixcbiAgICBBcHBseUV4cHJlc3Npb25cbiAgICB9ID0gcmVxdWlyZSgnLi9leHByZXNzaW9ucycpO1xuXG4vKipcbiAqIEBhdWdtZW50cyBFeHByZXNzaW9uVmlzaXRvcjxzdHJpbmc+XG4gKi9cbiBjbGFzcyBKYXZhc2NyaXB0VmlzaXRvciBleHRlbmRzIEV4cHJlc3Npb25WaXNpdG9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoXCJcIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VmFyaWFibGVFeHByZXNzaW9ufSB2ZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgdmlzaXRWYXJpYWJsZSh2ZSkge1xuICAgICAgICByZXR1cm4gdmUuaWQudmFsdWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb25FeHByZXNzaW9ufSBmZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgdmlzaXRGdW5jdGlvbihmZSkge1xuICAgICAgICByZXR1cm4gYCgke2ZlLnBhcmFtSWQudmFsdWV9ID0+ICR7ZmUuYm9keS5hY2NlcHQodGhpcyl9KWA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7QXBwbHlFeHByZXNzaW9ufSBhZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgdmlzaXRBcHBsaWNhdGlvbihhZSkge1xuICAgICAgICByZXR1cm4gYCR7YWUubGVmdC5hY2NlcHQodGhpcyl9KCR7YWUucmlnaHQuYWNjZXB0KHRoaXMpfSlgO1xuICAgIH1cbn1cblxuZXhwb3J0cy5KYXZhc2NyaXB0VmlzaXRvciA9IEphdmFzY3JpcHRWaXNpdG9yO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi4vbGMvanNUcmFuc3BpbGVyLmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIEB0cy1jaGVja1xuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2xjL2V4cHJlc3Npb25zLmQudHNcIiAvPlxuXG5jb25zdCB7XG4gICAgRXhwcmVzc2lvblZpc2l0b3IsXG4gICAgVmFyaWFibGVFeHByZXNzaW9uLFxuICAgIEZ1bmN0aW9uRXhwcmVzc2lvbixcbiAgICBBcHBseUV4cHJlc3Npb25cbiAgICB9ID0gcmVxdWlyZSgnLi4vLi4vbGMvZXhwcmVzc2lvbnMnKTtcblxuLyoqXG4gKiBAYXVnbWVudHMgRXhwcmVzc2lvblZpc2l0b3I8c3RyaW5nPlxuICovXG4gY2xhc3MgSmF2YXNjcmlwdFZpc2l0b3IgZXh0ZW5kcyBFeHByZXNzaW9uVmlzaXRvciB7XG4gICAgY29uc3RydWN0b3Ioc3RhcnQsIGVuZCkge1xuICAgICAgICBzdXBlcihcIlwiKTtcbiAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtWYXJpYWJsZUV4cHJlc3Npb259IHZlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICB2aXNpdFZhcmlhYmxlKHZlKSB7XG4gICAgICAgIGlmICh0aGlzLl9fdG9rZW5JblJhbmdlKHZlLmlkKSkge1xuICAgICAgICAgICAgcmV0dXJuIGA8Yj4ke3ZlLmlkLnZhbHVlfTwvYj5gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZS5pZC52YWx1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbkV4cHJlc3Npb259IGZlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICB2aXNpdEZ1bmN0aW9uKGZlKSB7XG4gICAgICAgIGlmICh0aGlzLl9fdG9rZW5JblJhbmdlKGZlLnBhcmFtSWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gYCg8Yj4ke2ZlLnBhcmFtSWQudmFsdWV9PC9iPiA9PiAke2ZlLmJvZHkuYWNjZXB0KHRoaXMpfSlgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgKCR7ZmUucGFyYW1JZC52YWx1ZX0gPT4gJHtmZS5ib2R5LmFjY2VwdCh0aGlzKX0pYDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtBcHBseUV4cHJlc3Npb259IGFlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICB2aXNpdEFwcGxpY2F0aW9uKGFlKSB7XG4gICAgICAgIHJldHVybiBgJHthZS5sZWZ0LmFjY2VwdCh0aGlzKX0oJHthZS5yaWdodC5hY2NlcHQodGhpcyl9KWA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7e2xpbmU6IG51bWJlciwgY29sOiBudW1iZXJ9fSB0b2tlblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIF9fdG9rZW5JblJhbmdlKHRva2VuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fdG9rZW5CZXlvbmRTdGFydCh0b2tlbikgJiYgdGhpcy5fX3Rva2VuQmVmb3JlRW5kKHRva2VuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3tsaW5lOiBudW1iZXIsIGNvbDogbnVtYmVyfX0gdG9rZW5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBfX3Rva2VuQmV5b25kU3RhcnQodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHRva2VuLmxpbmUgPiB0aGlzLnN0YXJ0LmxpbmVcbiAgICAgICAgICAgIHx8ICh0b2tlbi5saW5lID09PSB0aGlzLnN0YXJ0LmxpbmVcbiAgICAgICAgICAgICAgICAmJiB0b2tlbi5jb2wgPj0gdGhpcy5zdGFydC5jb2wpO1xuICAgIH1cblxuICAgICAvKipcbiAgICAgKiBAcGFyYW0ge3tsaW5lOiBudW1iZXIsIGNvbDogbnVtYmVyfX0gdG9rZW5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBfX3Rva2VuQmVmb3JlRW5kKHRva2VuKSB7XG4gICAgICAgIHJldHVybiB0b2tlbi5saW5lIDwgdGhpcy5lbmQubGluZVxuICAgICAgICAgICAgfHwgKHRva2VuLmxpbmUgPT09IHRoaXMuZW5kLmxpbmVcbiAgICAgICAgICAgICAgICAmJiB0b2tlbi5jb2wgPD0gdGhpcy5lbmQuY29sKTtcbiAgICB9XG59XG5cbmV4cG9ydHMuanNIaWdobGlnaHRUcmFuc3BpbGVyID0gSmF2YXNjcmlwdFZpc2l0b3I7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9qc0hpZ2hsaWdodFRyYW5zcGlsZXIuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY29uc3Qge3NjYW59ID0gcmVxdWlyZSgnLi4vLi4vbGMnKTtcblxuLyoqXG4qIEB0eXBlZGVmIHtPYmplY3R9IExpbmVQb3NcbiogQHByb3BlcnR5IHtudW1iZXJ9IGxpbmUtIGEgc3RyaW5nIHByb3BlcnR5IG9mIFNwZWNpYWxUeXBlXG4qIEBwcm9wZXJ0eSB7bnVtYmVyfSBjb2wgLSBhIG51bWJlciBwcm9wZXJ0eSBvZiBTcGVjaWFsVHlwZVxuKi9cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5TdHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydEluZGV4XG4gKiBAcGFyYW0ge251bWJlcn0gZW5kSW5kZXhcbiAqIEByZXR1cm5zIHt7c3RhcnQ6IExpbmVQb3MsIGVuZDogTGluZVBvc319XG4gKi9cbmZ1bmN0aW9uIGxpbmVQb3NpdGlvbnMoaW5TdHIsIHN0YXJ0SW5kZXgsIGVuZEluZGV4KSB7XG4gICAgbGV0IHN0YXJ0TGluZSA9IDA7XG4gICAgbGV0IHN0YXJ0Q29sID0gMDtcbiAgICBsZXQgZW5kTGluZSA9IDA7XG4gICAgbGV0IGVuZENvbCA9IDA7XG4gICAgbGV0IGN1cnJlbnRMaW5lID0gMTtcbiAgICBsZXQgY3VycmVudENvbCA9IDE7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGluU3RyLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBpZiAoaW5kZXggPT09IHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICAgIHN0YXJ0TGluZSA9IGN1cnJlbnRMaW5lO1xuICAgICAgICAgICAgc3RhcnRDb2wgPSBjdXJyZW50Q29sO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA9PT0gZW5kSW5kZXgpIHtcbiAgICAgICAgICAgIGVuZExpbmUgPSBjdXJyZW50TGluZTtcbiAgICAgICAgICAgIGVuZENvbCA9IGN1cnJlbnRDb2w7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudENvbCsrO1xuICAgICAgICBpZiAoaW5TdHJbaW5kZXhdID09PSAnXFxuJykge1xuICAgICAgICAgICAgY3VycmVudExpbmUrKztcbiAgICAgICAgICAgIGN1cnJlbnRDb2wgPSAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzdGFydEluZGV4ID49IGluU3RyLmxlbmd0aCkge1xuICAgICAgICBzdGFydExpbmUgPSBjdXJyZW50TGluZTtcbiAgICAgICAgc3RhcnRDb2wgPSBjdXJyZW50Q29sIC0gMTtcbiAgICB9XG4gICAgaWYgKGVuZEluZGV4ID49IGluU3RyLmxlbmd0aCkge1xuICAgICAgICBlbmRMaW5lID0gY3VycmVudExpbmU7XG4gICAgICAgIGVuZENvbCA9IGN1cnJlbnRDb2wgLSAxO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDoge1xuICAgICAgICAgICAgbGluZTogc3RhcnRMaW5lLFxuICAgICAgICAgICAgY29sOiBzdGFydENvbFxuICAgICAgICB9LFxuICAgICAgICBlbmQ6IHtcbiAgICAgICAgICAgIGxpbmU6IGVuZExpbmUsXG4gICAgICAgICAgICBjb2w6IGVuZENvbCxcbiAgICAgICAgfVxuICAgIH07XG59XG5cbi8qKlxuICogR2l2ZW4gdGhlIGlucHV0IHN0cmluZyBhbmQgYSBMaW5lUG9zIHdpbGwgc2hpZnQgdGhlIExpbmVQb3MgZG93blxuICogc28gdGhhdCBpdCBsaW5lcyB1cCB3aXRoIHRoZSBzdGFydCBvZiB0aGUgb3ZlcmxhcHBpbmcgdG9rZW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0clxuICogQHBhcmFtIHtMaW5lUG9zfSBzdGFydFBvc1xuICogQHJldHVybnMge0xpbmVQb3N9XG4gKi9cbmZ1bmN0aW9uIHNoaWZ0VG9Ub2tlblN0YXJ0KGlucHV0U3RyLCBzdGFydFBvcykge1xuICAgIC8qKiBAdHlwZSB7TGluZVBvc30gKi9cbiAgICBsZXQgbGFzdFRva2VuUG9zID0gdW5kZWZpbmVkO1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2Ygc2NhbihpbnB1dFN0cikpIHtcbiAgICAgICAgY29uc3QgcGFzc2VkID0gdG9rZW4ubGluZSA+IHN0YXJ0UG9zLmxpbmVcbiAgICAgICAgICAgIHx8ICh0b2tlbi5saW5lID09PSBzdGFydFBvcy5saW5lXG4gICAgICAgICAgICAgICAgJiYgdG9rZW4uY29sID49IHN0YXJ0UG9zLmNvbCk7XG4gICAgICAgIGlmIChwYXNzZWQpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RUb2tlblBvcyA9IHtcbiAgICAgICAgICAgIGxpbmU6IHRva2VuLmxpbmUsXG4gICAgICAgICAgICBjb2w6IHRva2VuLmNvbCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGxhc3RUb2tlblBvcyAhPT0gdW5kZWZpbmVkID8gbGFzdFRva2VuUG9zIDogc3RhcnRQb3M7XG59XG5cbmV4cG9ydHMubGluZVBvc2l0aW9ucyA9IGxpbmVQb3NpdGlvbnM7XG5leHBvcnRzLnNoaWZ0VG9Ub2tlblN0YXJ0ID0gc2hpZnRUb1Rva2VuU3RhcnQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9saW5lUG9zaXRpb25zLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuY29uc3QgdGltZW91dE1zID0gMTAgKiAxMDAwO1xuXG5jb25zdCB3b3JrZXJTY3JpcHQgPSAoZnVuY3Rpb24oKXtcbiAgICBmdW5jdGlvbiBzYW5kYm94U2NyaXB0KHNjcmlwdCkge1xuICAgICAgICBjb25zdCBpbGxlZ2FsQ2hhcnMgPSBgXFxgW10uXCIne30rLSpgO1xuICAgICAgICBjb25zdCBsb29rVXAgPSBuZXcgUmVnRXhwKFxuICAgICAgICAgICAgYFske2lsbGVnYWxDaGFycy5zcGxpdCgnJykubWFwKHYgPT4gYFxcXFwke3Z9YCkuam9pbignJyl9XWBcbiAgICAgICAgLCAnZycpO1xuXG4gICAgICAgIGlmIChsb29rVXAudGVzdChzY3JpcHQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHNjcmlwdCBjb250YWlucyBpbGxlZ2FsIGNoYXJhY3RlcnM6ICR7aWxsZWdhbENoYXJzfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIHdpdGggKHRyYXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCR7c2NyaXB0fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2h1cmNoTnVtZXJpYWxUb051bWJlcihjbikge1xuICAgICAgICByZXR1cm4gY24oYWNjID0+IGFjYyArIDEpKDApO1xuICAgIH1cblxuICAgIHNlbGYub25tZXNzYWdlPWZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHRyYXAgPSBuZXcgUHJveHkoe30sIHtcbiAgICAgICAgICAgIGhhczogKCkgPT4gdHJ1ZSxcbiAgICAgICAgICAgIGdldDogKCkgPT4gKGYgPT4geCA9PiB4KVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZnVuY3Rpb25Cb2R5ID0gc2FuZGJveFNjcmlwdChldmVudC5kYXRhKTtcbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBGdW5jdGlvbigndHJhcCcsIGZ1bmN0aW9uQm9keSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHByb2dyYW0odHJhcCk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHJlc3VsdDogcmVzdWx0LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBudW1iZXI6IGNodXJjaE51bWVyaWFsVG9OdW1iZXIocmVzdWx0KVxuICAgICAgICB9KTtcbiAgICB9O1xufSkudG9TdHJpbmcoKS5zbGljZSgnZnVuY3Rpb24oKSB7Jy5sZW5ndGgsIC0xKTtcblxuZnVuY3Rpb24gZXZhbHVhdGVTY3JpcHQoc2NyaXB0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcignZGF0YTphcHBsaWNhdGlvbi9qYXZhc2NyaXB0LCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHdvcmtlclNjcmlwdCkpO1xuICAgICAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCd3b3JrZXIgdGltZW91dCcpKTtcbiAgICAgICAgICAgIHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgfSwgdGltZW91dE1zKTtcblxuICAgICAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShlLmRhdGEpO1xuICAgICAgICAgICAgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICB9O1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uoc2NyaXB0KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0cy5ldmFsdWF0ZVNjcmlwdCA9IGV2YWx1YXRlU2NyaXB0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvb3V0cHV0RXZhbHVhdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9
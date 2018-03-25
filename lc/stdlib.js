// @ts-check
/// <reference path="./expressions.d.ts" />

const {
    Expression,
    ExpressionVisitor,
    ProgramExpression,
    VariableExpression,
    FunctionExpression,
    ApplyExpression
    } = require('./expressions');

const {scan, Token} = require('./scanner');
const {parse} = require('./parser');

const stdLib = Object.freeze({
    'I': makeLibFn('λx.x')
});

/**
 * @param {string} src
 * @returns {Expression}
 */
function makeLibFn(src) {
    return parse(cleanScan(src)).body;
}

/**
 * Scan the soruce but ignore token positions
 * @param {string} src
 * @returns {IterableIterator<Token>}
 */
function* cleanScan(src) {
    for (const token of scan(src)) {
        token.line = -1;
        token.col = -1;
        yield token;
    }
}

/**
 * @augments ExpressionVisitor<{ concat(): any }>
 */
 class StdLibAccessFinder extends ExpressionVisitor {
    constructor() {
        super({ concat() { return this } });
        /** @type {Set<keyof typeof stdLib>} */
        this.requiredFunctions = new Set();
    }
    /**
     * @returns {IterableIterator<[string, Expression]>}
     */
    *getRequiredFunctions() {
        for (const name of this.requiredFunctions.keys()) {
            yield [name, stdLib[name]];
        }
    }
    /**
     * @param {VariableExpression} ve
     */
    visitVariable(ve) {
        const id = ve.id.value;
        switch (id) {
            case 'I':
                this.requiredFunctions.add(id);
                break;
        }
        return this.empty();
    }
}

/**
 * @param {ProgramExpression} pe
 * @returns {ProgramExpression}
 */
function addStdLib(pe) {
    const finder = new StdLibAccessFinder();
    pe.accept(finder);
    const requiredLib = Array.from(finder.getRequiredFunctions());
    const newBody = requiredLib.reduceRight(
        (acc, [id]) => new FunctionExpression(Token.Variable({line: -1, col: -1}, id), acc), pe.body
    );
    const newProgram = requiredLib.reduce(
        (acc, [_, val]) => new ApplyExpression(acc, val), newBody
    );
    return new ProgramExpression(newProgram);
}

exports.addStdLib = addStdLib;

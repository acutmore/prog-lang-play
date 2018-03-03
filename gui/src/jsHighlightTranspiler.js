// @ts-check
/// <reference path="../../lc/expressions.d.ts" />

const {
    ExpressionVisitor,
    VariableExpression,
    FunctionExpression,
    ApplyExpression
    } = require('../../lc/expressions');

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

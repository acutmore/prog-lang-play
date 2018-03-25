// @ts-check
/// <reference path="./expressions.d.ts" />

const {
    ExpressionVisitor,
    ProgramExpression,
    VariableExpression,
    FunctionExpression,
    ApplyExpression
    } = require('./expressions');

/**
 * @augments ExpressionVisitor<string>
 */
 class JavascriptVisitor extends ExpressionVisitor {
    constructor() {
        super("");
    }
    /**
     * @param {ProgramExpression} pe
     * @returns {string}
     */
    visitProgram(pe) {
        return pe.body.accept(this);
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

// @ts-check
/// <reference path="./expressions.d.ts" />

const {Token} = require('./scanner');

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

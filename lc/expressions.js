// @ts-check

const {Token} = require('./scanner');

class Expression {
    /**
     * @param {ExpressionVisitor} visitor
     */
    accept(visitor) {}
}

class ExpressionVisitor {
    /**
     * @param {VariableExpression} ve
     */
    visitVariable(ve) {}
    /**
     * @param {FunctionExpression} fe
     */
    visitFunction(fe) {}
    /**
     * @param {ApplyExpression} ae
     */
    visitApplication(ae) {}
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
        visitor.visitVariable(this);
    }
}

class FunctionExpression extends Expression  {
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
        visitor.visitFunction(this);
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
        visitor.visitApplication(this);
    }
}

exports.Expression = Expression;
exports.ExpressionVisitor = ExpressionVisitor;
exports.VariableExpression = VariableExpression;
exports.FunctionExpression = FunctionExpression;
exports.ApplyExpression = ApplyExpression;

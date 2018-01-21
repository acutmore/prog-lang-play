// @ts-check

const {Token} = require('./scanner');

class Expression {};

class VariableExpression extends Expression {
    /**
     * @param {Token} id
     */
    constructor(id) {
        super();
        this.id = id;
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
}

exports.Expression = Expression;
exports.VariableExpression = VariableExpression;
exports.FunctionExpression = FunctionExpression;
exports.ApplyExpression = ApplyExpression;

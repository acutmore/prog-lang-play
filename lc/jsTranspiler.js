// @ts-check

const {
    ExpressionVisitor,
    VariableExpression,
    FunctionExpression,
    ApplyExpression
    } = require('./expressions');

class JavascriptVisitor extends ExpressionVisitor {

    /**
     * @param {(s: string) => void} callback 
     */
    constructor(callback) {
        super();
        this.callback = callback;
    }

    /**
     * @param {VariableExpression} ve
     */
    visitVariable(ve) {
        this.callback(ve.id.value);
    }
    /**
     * @param {FunctionExpression} fe
     */
    visitFunction(fe) {
        this.callback(`(${fe.paramId.value} => (`);
        fe.body.accept(this);
        this.callback(`))`);
    }
    /**
     * @param {ApplyExpression} ae
     */
    visitApplication(ae) {
        this.callback(`(`);
        ae.left.accept(this);
        this.callback(`(`);
        ae.right.accept(this);
        this.callback(`))`);
    }
}

exports.JavascriptVisitor = JavascriptVisitor;

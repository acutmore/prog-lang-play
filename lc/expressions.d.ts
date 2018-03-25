/// <reference path="./scanner.h.d.ts" />

import {Token} from './scanner';

declare module "./expressions.js" {

    class Expression {
        accept<T>(visitor: ExpressionVisitor<T>): T;
    }

    class ProgramExpression extends Expression {
        constructor(public body: Expression);
    }

    class VariableExpression extends Expression {
        constructor(public id: iToken);
    }

    class FunctionExpression extends Expression {
        constructor(public paramId: iToken, public body: Expression);
    }

    class ApplyExpression extends Expression {
        constructor(public left: Expression, public right: Expression);
    }

    class ExpressionVisitor<T> {
        constructor(empty: T);
        empty(): T;
        visitProgram(pe: ProgramExpression): T;
        visitVariable(ve: VariableExpression): T;
        visitFunction(fe: FunctionExpression): T;
        visitApplication(ae: ApplyExpression): T;
    }

}

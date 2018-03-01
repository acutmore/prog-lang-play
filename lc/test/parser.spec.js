
describe('parser', () => {
    const {deepStrictEqual} = require('assert');
    const {scan, Token} = require('../scanner');
    const {parse} = require('../parser');
    const { BracketOpen, BracketClose, Lambda, Dot, Variable, EOF } = Token;
    const { VariableExpression, FunctionExpression, ApplyExpression } = require('../expressions');
    const posFields = new Set(['line', 'col']);
    const p = { line: 0, col: 0 };

    function cleanTree(tree) {
        return JSON.parse(
            JSON.stringify(tree, (key, value) => posFields.has(key) ? 0 : value)
        );
    }

    it('parses pre-balanced', () => {
        const input = `((λx.x)(λy.y))`;
        const tree = parse(scan(input));
        const expected = new ApplyExpression(
            new FunctionExpression(
                Variable(p, 'x'),
                new VariableExpression(Variable(p, 'x'))
            ),
            new FunctionExpression(
                Variable(p, 'y'),
                new VariableExpression(Variable(p, 'y'))
            )
        );
        deepStrictEqual(
            cleanTree(tree),
            cleanTree(expected)
        );
    });

    it('parses ambiguous functions', () => {
        deepStrictEqual(
            cleanTree(parse(scan(`λx.m n`))),
            cleanTree(parse(scan(`λx.(m n)`))),
        );
    });

    it('parses ambiguous application', () => {
        deepStrictEqual(
            cleanTree(parse(scan(`m n p`))),
            cleanTree(parse(scan(`(m n) p`)))
        );
    });

    it(`numeric literal '0' de-sugars to Church numeral`, () => {
        deepStrictEqual(
            cleanTree(parse(scan(`0`))),
            cleanTree(parse(scan(`λf.λx.x`)))
        );
    });

    it(`numeric literal '1' de-sugars to Church numeral`, () => {
        deepStrictEqual(
            cleanTree(parse(scan(`1`))),
            cleanTree(parse(scan(`λf.λx.f x`)))
        );
    });

    it(`numeric literal '2' de-sugars to Church numeral`, () => {
        deepStrictEqual(
            cleanTree(parse(scan(`2`))),
            cleanTree(parse(scan(`λf.λx.f (f x)`)))
        );
    });

    it('parses top level numeric apply', () => {
        const input = `someFunction 0`;
        const tree = parse(scan(input));
        const expected = new ApplyExpression(
            new VariableExpression(
                Variable(p, 'someFunction')
            ),
            new FunctionExpression(
                Variable(p, 'f'),
                new FunctionExpression(
                    Variable(p, 'x'),
                    new VariableExpression(Variable(p, 'x'))
                )
            )
        );
        deepStrictEqual(
            cleanTree(tree),
            cleanTree(expected)
        );
    });

    it(`let expression de-sugars to function application`, () => {
        deepStrictEqual(
            cleanTree(parse(scan(`let x = λx.x in x x`))),
            cleanTree(parse(scan(`(λx.x x)(λx.x)`)))
        );
    });

    it(`poly let expression de-sugars to mutiple function applications`, () => {
        deepStrictEqual(
            cleanTree(parse(scan(`let x = λx.x, y = λy.y in x y`))),
            cleanTree(parse(scan(`(λx.λy.x y)(λx.x)(λy.y)`)))
        );
    });
});

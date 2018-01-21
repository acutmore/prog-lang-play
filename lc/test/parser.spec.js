
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
});

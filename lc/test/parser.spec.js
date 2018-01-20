
describe('parser', () => {
    const {deepStrictEqual} = require('assert');
    const {scan, Token} = require('../scanner');
    const {parse} = require('../parser');

    it('parses', () => {
        const input = `((λx.x)(λy.y))`;
        const tree = parse(scan(input));
        const expected = {
            "left": {
                "paramId": { "type": "VAR", "line": 1, "col": 4, "value": "x" },
                "body": { "type": "VAR", "line": 1, "col": 6, "value": "x" }
            },
            "right": {
                "paramId": { "type": "VAR", "line": 1, "col": 10, "value": "y" },
                "body": { "type": "VAR", "line": 1, "col": 12, "value": "y" }
            }
        };
        deepStrictEqual(
            JSON.parse(JSON.stringify(tree)),
            JSON.parse(JSON.stringify(expected))
        );
    });
});

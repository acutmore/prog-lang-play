
describe('parser', () => {
    const {deepStrictEqual} = require('assert');
    const {scan, Token} = require('../scanner');
    const {parse} = require('../parser');
    const ignoreFields = new Set(['line', 'col']);

    function trimTree(tree) {
        return JSON.parse(
            JSON.stringify(tree, (key, value) => ignoreFields.has(key) ? void 0 : value)
        );
    }

    it('parses', () => {
        const input = `((λx.x)(λy.y))`;
        const tree = parse(scan(input));
        const expected = {
            'left': {
                'paramId': { 'type': 'VAR', 'value': 'x' },
                'body': { 'type': 'VAR', 'value': 'x' }
            },
            'right': {
                'paramId': { 'type': 'VAR', 'value': 'y' },
                'body': { 'type': 'VAR', 'value': 'y' }
            }
        };
        deepStrictEqual(
            trimTree(tree),
            expected
        );
    });
});

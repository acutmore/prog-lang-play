
describe('stdlib', () => {
    const {deepStrictEqual} = require('assert');
    const {scan} = require('../scanner');
    const {parse} = require('../parser');
    const {frontend, compileToJs} = require('../index');
    const posFields = new Set(['line', 'col']);

    function cleanTree(tree) {
        return JSON.parse(
            JSON.stringify(tree, (key, value) => posFields.has(key) ? 0 : value)
        );
    }

    it('includes the identity function in stdlib', () => {
        deepStrictEqual(
            cleanTree(frontend(`I z`)),
            cleanTree(parse(scan(`(λI.I z)(λx.x)`))),
        );
    });

});

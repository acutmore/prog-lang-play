// @ts-check

const {scan} = require('./scanner');
const {parse} = require('./parser');
const {JavascriptVisitor} = require('./jsTranspiler');

/**
 * @param {string} str
 * @returns {string}
 */
function compileToJs(str) {
    const tokens = scan(str);
    const program = parse(tokens);
    const visitor = new JavascriptVisitor();
    return program.accept(visitor);
}

exports.compileToJs = compileToJs;

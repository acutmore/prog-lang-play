// @ts-check

const {scan} = require('./scanner');
const {parse} = require('./parser');
const {JavascriptVisitor} = require('./jsTranspiler');

/**
 * @param {string} str
 * @returns {string}
 */
function compileToJs(str) {
    let retVal = '';
    const visitor = new JavascriptVisitor(s => retVal += s);
    const tokens = scan(str);
    const program = parse(tokens);
    program.accept(visitor);
    return retVal;
}

exports.compileToJs = compileToJs;

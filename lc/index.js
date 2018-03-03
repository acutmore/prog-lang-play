// @ts-check
/// <reference path="./expressions.d.ts" />

const {scan} = require('./scanner');
const {parse} = require('./parser');
const {Expression} = require('./expressions');
const {JavascriptVisitor} = require('./jsTranspiler');

/**
 * @param {string} str
 * @returns {Expression}
 */
function frontend(str) {
    const tokens = scan(str);
    return parse(tokens);
}

/**
 * @param {string} str
 * @returns {string}
 */
function compileToJs(str) {
    const program = frontend(str);
    const visitor = new JavascriptVisitor();
    return program.accept(visitor);
}

exports.scan = scan;
exports.parse = parse;
exports.frontend = frontend;
exports.compileToJs = compileToJs;

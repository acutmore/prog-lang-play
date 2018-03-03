const {scan} = require('../../lc');

/**
* @typedef {Object} LinePos
* @property {number} line- a string property of SpecialType
* @property {number} col - a number property of SpecialType
*/

/**
 * @param {string} inStr
 * @param {number} startIndex
 * @param {number} endIndex
 * @returns {{start: LinePos, end: LinePos}}
 */
function linePositions(inStr, startIndex, endIndex) {
    let startLine = 0;
    let startCol = 0;
    let endLine = 0;
    let endCol = 0;
    let currentLine = 1;
    let currentCol = 1;
    for (let index = 0; index < inStr.length; index++) {
        if (index === startIndex) {
            startLine = currentLine;
            startCol = currentCol;
        }
        if (index === endIndex) {
            endLine = currentLine;
            endCol = currentCol;
        }
        currentCol++;
        if (inStr[index] === '\n') {
            currentLine++;
            currentCol = 1;
        }
    }
    if (endIndex >= inStr.length) {
        endLine = currentLine;
        endCol = currentCol - 1;
    }
    return {
        start: {
            line: startLine,
            col: startCol
        },
        end: {
            line: endLine,
            col: endCol,
        }
    };
}

/**
 * Given the input string and a LinePos will shift the LinePos down
 * so that it lines up with the start of the overlapping token
 * @param {string} inputStr
 * @param {LinePos} startPos
 * @returns {LinePos}
 */
function shiftToTokenStart(inputStr, startPos) {
    /** @type {LinePos} */
    let lastTokenPos = undefined;
    for (const token of scan(inputStr)) {
        const passed = token.line > startPos.line
            || (token.line === startPos.line
                && token.col >= startPos.col);
        if (passed) {
            break;
        }
        lastTokenPos = {
            line: token.line,
            col: token.col,
        };
    }
    return lastTokenPos !== undefined ? lastTokenPos : startPos;
}

exports.linePositions = linePositions;
exports.shiftToTokenStart = shiftToTokenStart;

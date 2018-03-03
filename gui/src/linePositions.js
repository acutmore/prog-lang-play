
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

exports.linePositions = linePositions;

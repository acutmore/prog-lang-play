// @ts-check

class CompilerError extends Error {

    /**
     * @param {string} msg
     * @param {{line: number, col: number}} pos
     */
    constructor(msg, pos) {
        super(msg);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CompilerError);
        }
        this.pos = pos;
    }

    /**
     * @param {string} src
     * @returns {string}
     */
    userMessage(src) {
        const {line, col} = this.pos;
        const str = src.split('\n')[line - 1];
        const start = Math.max(0, col - 7);
        return [
            `${this.message}`,
            `${str.substr(start, 14)}`,
            // `${''.padStart(padding, ' ')}^`
            `${``.padStart(col - start - 1, ' ')}^`
        ].join('\n');
    }
}

exports.CompilerError = CompilerError;


describe('linePositions', () => {
    const {deepStrictEqual} = require('assert');
    const {linePositions, shiftToTokenStart} = require('../src/linePositions');

    const src =
        'foo bar' + '\n' +
        'zar car';

    it('returns the start line positions of the string indexes', () => {
        const {start} = linePositions(src, src.indexOf('car'), 0);
        deepStrictEqual(
            start,
            { line: 2, col: 5 }
        );
    });

    it('returns the end line positions of the string indexes', () => {
        const {end} = linePositions(src, 0, src.indexOf('car'));
        deepStrictEqual(
            end,
            { line: 2, col: 5 }
        );
    });

    it('returns zero for when the indexs are < 0', () => {
        const {start, end} = linePositions(src, -1, -1);
        deepStrictEqual(
            start,
            { line: 0, col: 0 }
        );
        deepStrictEqual(
            end,
            { line: 0, col: 0 }
        );
    });

    it('returns the end when the start index is beyond the bounds', () => {
        const {start} = linePositions(src, 1000, -1);
        deepStrictEqual(
            start,
            { line: 2, col: 7 }
        );
    });

    it('returns the end when the end index is beyond the bounds', () => {
        const {end} = linePositions(src, -1, 10000);
        deepStrictEqual(
            end,
            { line: 2, col: 7 }
        );
    });

    describe('shiftToTokenStart', () => {
        it('returns the start position of the overlapping token', () => {
            const src = `λfoo.bar`;
            const originalStart = { line: 1, col: src.indexOf('oo') + 1};
            const shiftedStart = shiftToTokenStart(src, originalStart);
            deepStrictEqual(
                shiftedStart,
                { line: 1, col: src.indexOf('foo') + 1}
            );
        });
    });

});

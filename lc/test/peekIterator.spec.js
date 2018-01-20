
describe('peekIterator', () => {
    const {equal} = require('assert');
    const {PeekIterator} = require('../peekIterator');

    function setup() {
        return new PeekIterator('qwerty'[Symbol.iterator]());
    }

    it('advances to the end', () => {
        const pi = setup();
        equal(pi.done(), false);
        equal(pi.advance(), 'q');
        equal(pi.done(), false);
        equal(pi.advance(), 'w');
        equal(pi.done(), false);
        equal(pi.advance(), 'e');
        equal(pi.done(), false);
        equal(pi.advance(), 'r');
        equal(pi.done(), false);
        equal(pi.advance(), 't');
        equal(pi.done(), false);
        equal(pi.advance(), 'y');
        equal(pi.done(), false);
        equal(pi.advance(), '\0');
        equal(pi.done(), true);
    });

    it('can peek ahead one by default', () => {
        const pi = setup();
        equal(pi.advance(), 'q');
        equal(pi.advance(), 'w');
        equal(pi.advance(), 'e');

        equal(pi.peek(), 'r');
        equal(pi.peek(), 'r');
        equal(pi.advance(), 'r');

        equal(pi.advance(), 't');

        equal(pi.peek(), 'y');
        equal(pi.peek(), 'y');
        equal(pi.advance(), 'y');

        equal(pi.peek(), '\0');
        equal(pi.peek(), '\0');
        equal(pi.done(), false);
        equal(pi.advance(), '\0');
        equal(pi.done(), true);
    });

    it('can peek ahead N', () => {
        const pi = setup();
        equal(pi.peek(7), '\0');
        equal(pi.peek(4), 'r');
        equal(pi.done(), false);
        equal(pi.advance(), 'q');
    });
});

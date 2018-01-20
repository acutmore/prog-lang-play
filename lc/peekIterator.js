// @ts-check
/// <reference path="./peekIteratorInterface.d.ts" />

/**
 * @template T
 * @implements {iPeekIterator<T>}
 */
class PeekIterator {

    /**
     * @template T
     * @param {Iterator<T>} [srcIterator] - Iterator being wrapped
     * @returns {iPeekIterator<T>}
     */
    constructor(srcIterator) {
        this.iterator = srcIterator;
        /** @type{IteratorResult<T>} */
        this.currentPos = void 0;
        this.index = -1;
        /** @type{Map<number, IteratorResult<T>>} */
        this.peekCache = new Map();
    }

    advance() {
        this.index++;
        let pos = this.peekCache.get(this.index);
        if (pos !== void 0) {
            this.peekCache.delete(this.index);
        } else {
            pos = this.iterator.next();
        }
        this.currentPos = pos;
        return this.__itValue(pos);
    }

    peek(i = 1) {
        if (i < 1) {
            throw new Error('peek distance must be >= 1');
        }

        const nextIndex = this.index + i;
        const peekPos = this.peekCache.get(nextIndex);
        if (peekPos !== void 0) {
            return this.__itValue(peekPos);
        }
        if (i > 1) {
            this.peek(i - 1);
        }
        const n = this.iterator.next();
        this.peekCache.set(nextIndex, n);
        return this.__itValue(n);
    }

    done() {
        return this.currentPos !== void 0 && this.currentPos.done;
    }

    /**
     * @template T
     * @param {IteratorResult<T>} i 
     */
    __itValue(i) {
        if (i.done) {
            return '\0';
        } else {
            return i.value;
        }
    }
}

exports.PeekIterator = PeekIterator;

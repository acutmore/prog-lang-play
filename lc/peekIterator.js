
/// <reference path="./peekIteratorInterface.d.ts" />

/**
 * @template T
 * @augments {iPeekIterator<T>}
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
        return pos.value;
    }

    peek() {
        const nextIndex = this.index + 1;
        const peekPos = this.peekCache.get(nextIndex);
        if (peekPos !== void 0) {
            return peekPos.value;
        }
        const n = this.iterator.next();
        this.peekCache.set(nextIndex, n);
        return n.value;
    }

    done() {
        return this.currentPos !== void 0 && this.currentPos.done;
    }
}

exports.PeekIterator = PeekIterator;

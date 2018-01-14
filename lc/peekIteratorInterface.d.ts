
interface iPeekIterator<T> {

    constructor(srcIterator: Iterator<T>);

    currentPos: IteratorResult<T>;
    advance(): T;
    peek(): T;
    done(): boolean;
}

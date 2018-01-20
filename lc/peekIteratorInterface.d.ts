
interface iPeekIterator<T> {

    constructor(srcIterator: Iterator<T>);

    currentPos: IteratorResult<T>;
    advance(): T;
    peek(i?: number): T;
    done(): boolean;
}

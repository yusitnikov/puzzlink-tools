export class Position {
    constructor(public bx = 0, public by = 0) {
    }

    set(addr: Position) {
        this.bx = addr.bx;
        this.by = addr.by;
        return this;
    }

    equals(pos: Position) {
        return this.bx === pos.bx && this.by === pos.by;
    }
}

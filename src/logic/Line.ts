import {Position} from "../pzpr-copy-paste/position";

export class Line<PositionT extends Position = Position> {
    constructor(public start: PositionT, public end: PositionT) {
    }

    getVector() {
        return new Position(this.end.bx - this.start.bx, this.end.by - this.start.by);
    }
}

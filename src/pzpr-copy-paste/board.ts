import {Position} from "./position";
import {Cell} from "./cell";
import {indexes} from "./utils";

export class Board {
    cell: Cell[];
    border: Position[];

    constructor(public cols = 8, public rows = 8) {
        this.cell = indexes(rows * cols).map(() => new Cell());
        this.border = [
            ...indexes(cols).map(index => new Position(2 * index + 1, 0)),
            ...indexes(cols).map(index => new Position(2 * index + 1, 2 * rows)),
            ...indexes(rows).map(index => new Position(0, 2 * index + 1)),
            ...indexes(rows).map(index => new Position(2 * cols, 2 * index + 1)),
        ];
    }
}

import {Encode} from "../encode";
import {Position} from "../position";
import {Board} from "../board";

class InOutAddress extends Position {
    partner: InOutAddress | null = null;

    constructor(public board: IcelomBoard, bx = 0, by = 0) {
        super(bx, by);
    }

    setid(id: number) {
        if (isNaN(id)) {
            throw new Error("Border id is not a number");
        }

        this.input(this.board.border[id]);
    }

    input(border?: Position) {
        if (!border) {
            throw new Error("The border is undefined");
        }

        if (!this.partner!.equals(border)) {
            if (!this.equals(border)) {
                this.set(border);
            }
        } else {
            this.board.exchangeinout();
        }
    }
}

export class IcelomBoard extends Board {
    arrowin: InOutAddress;
    arrowout: InOutAddress;

    constructor(cols = 8, rows = 8) {
        super(cols, rows);

        const isBig = cols >= 3;
        this.arrowin = new InOutAddress(this, 1, 0);
        this.arrowout = new InOutAddress(this, isBig ? 5 : 1, isBig ? 0 : 2 * rows);
        this.arrowin.partner = this.arrowout;
        this.arrowout.partner = this.arrowin;
    }

    exchangeinout() {
        const tmp = this.arrowin;
        this.arrowin = this.arrowout;
        this.arrowout = tmp;
    }
}

export class Icelom extends Encode<IcelomBoard> {
    decodeInOut() {
        const barray = this.outbstr.split("/"),
            bd = this.board;

        bd.arrowin.setid(+barray[1] || 0);
        bd.arrowout.setid(+barray[2] || 0);

        this.outbstr = "";
    }

    decodePzpr() {
        this.decodeIce();
        this.decodeNumber16();
        this.decodeInOut();
    }
}

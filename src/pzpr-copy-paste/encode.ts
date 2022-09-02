import {Board} from "./board";

const parseIntOrDie = (str: string, radix: number) => {
    const result = parseInt(str, radix);
    if (Number.isNaN(result)) {
        throw new Error(`Error parsing number ${str} with radix ${radix}`);
    }
    return result;
}

export class Encode<BoardT extends Board = Board> {
    constructor(public board: BoardT, public outbstr: string) {
    }

    include<T>(ca: T, bottom: T, up: T) {
        return bottom <= ca && ca <= up;
    }

    readNumber16(bstr: string, i: number) {
        const ca = bstr.charAt(i);

        if (this.include(ca, "0", "9") || this.include(ca, "a", "f")) {
            return [parseIntOrDie(ca, 16), 1];
        } else if (ca === "-") {
            return [parseIntOrDie(bstr.substr(i + 1, 2), 16), 3];
        } else if (ca === "+") {
            return [parseIntOrDie(bstr.substr(i + 1, 3), 16), 4];
        } else if (ca === "=") {
            return [parseIntOrDie(bstr.substr(i + 1, 3), 16) + 4096, 4];
        } else if (ca === "%") {
            return [parseIntOrDie(bstr.substr(i + 1, 3), 16) + 8192, 4];
        } else if (ca === ".") {
            return [-2, 1];
        } else {
            return [-1, 0];
        }
    }

    decodeNumber16() {
        let c = 0,
            i = 0;
        const bstr = this.outbstr,
            bd = this.board;
        while (i < bstr.length && bd.cell[c]) {
            const cell = bd.cell[c],
                ca = bstr.charAt(i);
            const res = this.readNumber16(bstr, i);
            if (res[0] !== -1) {
                cell.qnum = res[0];
                i += res[1];
                c++;
            } else if (ca >= "g" && ca <= "z") {
                c += parseIntOrDie(ca, 36) - 15;
                i++;
            } else {
                i++;
            }
        }
        this.outbstr = bstr.substr(i);
    }

    decodeQues(val: number) {
        let i;
        const bstr = this.outbstr,
            bd = this.board;

        let c = 0;
        const twi = [16, 8, 4, 2, 1];
        for (i = 0; i < bstr.length; i++) {
            const num = parseInt(bstr.charAt(i), 32);
            for (let w = 0; w < 5; w++) {
                if (!!bd.cell[c]) {
                    bd.cell[c].ques = num & twi[w] ? val : 0;
                    c++;
                }
            }
            if (!bd.cell[c]) {
                break;
            }
        }
        this.outbstr = bstr.substr(i + 1);
    }

    decodeIce() {
        this.decodeQues(6);
    }
}

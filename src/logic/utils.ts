import {Position} from "../pzpr-copy-paste/position";
import {Line} from "./Line";

export const getLineByBorder = ({bx, by}: Position) =>
    bx % 2
        ? new Line(new Position(bx, by - 1), new Position(bx, by + 1))
        : new Line(new Position(bx - 1, by), new Position(bx + 1, by));

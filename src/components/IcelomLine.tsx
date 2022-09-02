import {cellSize} from "./constants";
import {Line} from "../logic/Line";

interface IcelomLineProps {
    line: Line;
    color?: string;
}

export const IcelomLineComponent = ({line: {start, end}, color = "#000"}: IcelomLineProps) => <div style={{
    position: "absolute",
    left: Math.min(start.bx, end.bx) * cellSize / 2 - 1,
    top: Math.min(start.by, end.by) * cellSize / 2 - 1,
    width: Math.abs(start.bx - end.bx) * cellSize / 2 + 2,
    height: Math.abs(start.by - end.by) * cellSize / 2 + 2,
    background: color,
}}/>;

import {Icelom} from "../pzpr-copy-paste/variety/icelom";
import {cellSize} from "./constants";
import {IcelomLineComponent} from "./IcelomLine";
import {IcelomSolver} from "../logic/IcelomSolver";
import {PropsWithChildren} from "react";
import {Position} from "../pzpr-copy-paste/position";

interface IcelomBoardProps {
    icelom: Icelom;
    solver?: IcelomSolver;
}

const lineColors = [
    "#0c0",
    "#f00",
    "#00f",
    // "#0cf",
    "#f0f",
    "#ff0",
    "#888",
];

export const IcelomBoardComponent = (
    {
        icelom: {board: {cols: width, rows: height, cell}},
        solver,
    }: IcelomBoardProps
) => {
    return <div style={{padding: cellSize / 2}}>
        <div style={{
            position: "relative",
            width: width * cellSize,
            height: height * cellSize,
            border: "1px solid #000",
            fontSize: `${cellSize * 0.7}px`,
            lineHeight: "1em",
        }}>
            {cell.map(({ques, qnum}, index) => <IcelomCell
                key={index}
                border={true}
                ice={ques !== 0}
            >
                {qnum >= 0 && qnum}
            </IcelomCell>)}

            {solver && <>
                {solver.borders.values().map(({bx, by, line, cells}, index) => <div key={index}>
                    {line && <IcelomLineComponent
                        line={cells}
                        color={lineColors[line === solver.lineOut ? 1 : line.group.index % lineColors.length]}
                    />}

                    {line === false && <IcelomCell position={new Position(bx - 1, by - 1)}>&times;</IcelomCell>}
                </div>)}
            </>}
        </div>
    </div>;
};

interface IcelomCellProps {
    position?: Position;
    border?: boolean;
    ice?: boolean;
}

const IcelomCell = ({position, border, ice, children}: PropsWithChildren<IcelomCellProps>) => <div
    style={{
        ...(position && {
            position: "absolute",
            left: position.bx * cellSize / 2,
            top: position.by * cellSize / 2,
        }),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "top",
        width: cellSize,
        height: cellSize,
        border: border ? "1px solid #000" : undefined,
        boxSizing: "border-box",
        background: ice ? "#8ff" : undefined,
        color: "#000",
    }}
>
    {children}
</div>;
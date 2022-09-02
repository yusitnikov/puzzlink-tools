import {useMemo, useState} from "react";
import {Icelom, IcelomBoard} from "../../pzpr-copy-paste/variety/icelom";
import {IcelomBoardComponent} from "../IcelomBoard";
import {IcelomSolver} from "../../logic/IcelomSolver";
import {indexes} from "../../pzpr-copy-paste/utils";

const maxSize = 30;

interface Props {
    hash: string[];
    setHash: (...parts: any[]) => void;
}

export const IcelomByStrOnly = ({hash, setHash}: Props) => {
    const str = hash[0];

    const setStr = (str: string) => setHash(str);

    const [inputStr, setInputStr] = useState(str);

    const {solvers, time} = useMemo(
        () => {
            const startTime = Date.now();
            const solvers = indexes(3, maxSize)
                .flatMap(
                    (width) => indexes(3, maxSize).map(
                        (height) => new IcelomSolver(new Icelom(new IcelomBoard(width, height), str))
                    )
                )
                .filter((solver) => !solver.lastError)
                .sort(
                    (a, b) =>
                        ((a.isLoopFinished() ? 0 : 1) - (b.isLoopFinished() ? 0 : 1)) ||
                        (a.icelom.board.rows * a.icelom.board.cols - b.icelom.board.rows * b.icelom.board.cols)
                );
            return {
                solvers,
                time: (Date.now() - startTime) / 1000,
            }
        },
        [str]
    );

    return <div>
        <div style={{marginBottom: "1em"}}>
            <form onSubmit={(ev) => {
                ev.preventDefault();
                setStr(inputStr);
            }}>
                String: <input type={"text"} value={inputStr} onChange={({target: {value}}) => setInputStr(value)}/>{" "}
                <button type={"submit"} disabled={str === inputStr}>Search</button>
            </form>
        </div>

        <div style={{marginBottom: "1em"}}>Found {solvers.length} puzzle(s) in {time} seconds</div>

        {solvers.map((solver, index) => <a
            key={index}
            href={`#${solver.icelom.board.cols}/${solver.icelom.board.rows}/${str}`}
            target={"_blank"}
            style={{
                display: "inline-block",
                verticalAlign: "top",
            }}
        >
            <IcelomBoardComponent icelom={solver.icelom} solver={solver}/>
        </a>)}
    </div>;
};

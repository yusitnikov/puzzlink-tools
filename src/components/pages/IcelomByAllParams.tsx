import {useMemo} from "react";
import {Icelom, IcelomBoard} from "../../pzpr-copy-paste/variety/icelom";
import {IcelomBoardComponent} from "../IcelomBoard";
import {IcelomSolver} from "../../logic/IcelomSolver";

interface Props {
    hash: string[];
    setHash: (...parts: any[]) => void;
}

export const IcelomByAllParams = ({hash, setHash}: Props) => {
    const width = Number(hash[0]);
    const height = Number(hash[1]);
    const str = hash[2];

    const setWidth = (width: number) => setHash(width, height, str);
    const setHeight = (height: number) => setHash(width, height, str);
    const setStr = (str: string) => setHash(width, height, str);

    const solver = useMemo(
        () => new IcelomSolver(new Icelom(new IcelomBoard(width, height), str)),
        [height, width, str]
    );

    const url = `https://puzz.link/p?icelom/a/${width}/${height}/${str}`;

    return <div>
        <div style={{marginBottom: "1em"}}>
            Width: <input type={"number"} value={width} onChange={({target: {value}}) => setWidth(Number(value))} style={{width: 40}}/>{" "}
            Height: <input type={"number"} value={height} onChange={({target: {value}}) => setHeight(Number(value))} style={{width: 40}}/>{" "}
            String: <input type={"text"} value={str} onChange={({target: {value}}) => setStr(value)}/>
        </div>

        <div style={{marginBottom: "1em"}}>
            <a href={url} target={"_blank"}>{url}</a>
        </div>

        <IcelomBoardComponent icelom={solver.icelom} solver={solver}/>

        {solver.lastError && <div style={{marginTop: "1em", whiteSpace: "pre-wrap"}}>{solver.lastError}</div>}
    </div>;
};

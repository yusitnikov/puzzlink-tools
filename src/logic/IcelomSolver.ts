import {Icelom} from "../pzpr-copy-paste/variety/icelom";
import {Position} from "../pzpr-copy-paste/position";
import {Line} from "./Line";
import {getLineByBorder} from "./utils";
import {CoordsMap} from "./CoordsMap";

export class IcelomSolver {
    private _autoIncrementId = 0;

    lineIn?: LineInfo;
    lineOut?: LineInfo;

    lastError?: string;

    borders = new CoordsMap<BorderInfo>();
    cells = new CoordsMap<CellInfo>();

    emptyCellsCount = 0;

    constructor(public icelom: Icelom) {
        this._init();
    }

    checkIcelomValidity() {
        const {cols: width, rows: height, cell: cells} = this.icelom.board;

        let lastIceCellIndex = 0;
        for (const [index, {ques}] of cells.entries()) {
            if (ques) {
                lastIceCellIndex = index;
            }
        }
        if (lastIceCellIndex < width * (height - 2)) {
            throw new Error("The last 2 rows have no ice");
        }

        const qnumsSet = new Set<number>();
        for (const {ques, qnum} of cells) {
            if (qnum >= 0) {
                if (ques) {
                    throw new Error("Icelom number in the ice cell");
                }

                if (qnumsSet.has(qnum)) {
                    throw new Error(`Repeating icelom number ${qnum}`);
                }

                qnumsSet.add(qnum);
            }
        }

        if (qnumsSet.size) {
            const qnumsList = [...qnumsSet].sort();
            const minQnum = qnumsList[0];
            const maxQnum = qnumsList[qnumsList.length - 1];
            if (minQnum !== 1) {
                throw new Error(`The minimal icelom number is ${minQnum} instead of 1`);
            }
            if (maxQnum !== qnumsList.length) {
                throw new Error("The icelom numbers are not sequential");
            }
        }
    }

    private _init() {
        try {
            this.icelom.decodePzpr();
            this.checkIcelomValidity();

            const {cols, rows, arrowin, arrowout} = this.icelom.board;

            for (let x = 1; x < 2 * cols; x += 2) {
                for (let y = 1; y < 2 * rows; y += 2) {
                    if (x !== 1) {
                        new BorderInfo(this, x - 1, y);
                    }
                    if (y !== 1) {
                        new BorderInfo(this, x, y - 1);
                    }
                }
            }

            // Important: first add all borders, only then add the lines
            const borderIn = new BorderInfo(this, arrowin.bx, arrowin.by);
            const borderOut = new BorderInfo(this, arrowout.bx, arrowout.by);

            this.lineIn = new LineInfo(this, borderIn);
            this.lineOut = borderOut.line || new LineInfo(this, borderOut);

            this.applyLogic();
        } catch (e) {
            this.lastError = e instanceof Error ? (/*e.stack ?? */e.message) : e!.toString();
        }
    }

    getNextId() {
        return this._autoIncrementId++;
    }

    getOrCreateCell(bx: number, by: number): CellInfo {
        let cell = this.cells.get(bx, by);
        if (!cell) {
            cell = new CellInfo(this, bx, by);
            this.cells.set(bx, by, cell);
            if (!cell.isIce) {
                ++this.emptyCellsCount;
            }
        }
        return cell;
    }

    decrementEmptyLinesCount() {
        const newCount = --this.emptyCellsCount;
        if (newCount === 0) {
            this.applyLogic();
        }
    }

    isLoopFinished(): boolean {
        const {lineIn, lineOut} = this;
        return !!lineIn && !!lineOut && lineIn.group.index === lineOut.group.index;
    }

    applyLogic() {
        for (const cell of this.cells.values()) {
            cell.applyLogic();
        }

        for (const border of this.borders.values()) {
            border.applyLogic();
        }

        if (this.isLoopFinished() && this.emptyCellsCount !== 0) {
            throw new Error("Empty cells remained after finishing the loop");
        }
    }
}

class LineInfo {
    group: LineGroup;

    constructor(public solver: IcelomSolver, public border: BorderInfo) {
        this.group = new LineGroup(solver.getNextId(), [this]);
        border.setLine(this);
    }
}

class LineGroup {
    constructor(public index: number, public lines: LineInfo[] = []) {
    }

    merge(group: LineGroup) {
        if (group.index === this.index) {
            throw new Error("Attempting to merge a line with itself");
        }

        if (group.index > this.index) {
            group.merge(this);
            return;
        }

        group.lines.push(...this.lines);

        for (const line of this.lines) {
            line.group = group;
        }
    }
}

class BorderInfo extends Position {
    line?: LineInfo | false;

    readonly cells: Line<CellInfo>;

    constructor(public solver: IcelomSolver, bx: number, by: number) {
        super(bx, by);

        const {start, end} = getLineByBorder(new Position(bx, by));
        const startCell = this.solver.getOrCreateCell(start.bx, start.by);
        const endCell = this.solver.getOrCreateCell(end.bx, end.by)
        this.cells = new Line(startCell, endCell);
        startCell.addAllowedLine(this);
        endCell.addAllowedLine(this);

        this.solver.borders.set(bx, by, this);
    }

    setLine(line: LineInfo) {
        if (this.line !== undefined) {
            throw new Error(`Line is already set in setLine() of ${this.bx},${this.by}`);
        }

        this.line = line;

        this._reIndexConnectedLine(this.cells.start);
        this._reIndexConnectedLine(this.cells.end);

        this.cells.start.incrementLinesCount();
        this.cells.end.incrementLinesCount();

        this.applyLogic();
    }

    private _reIndexConnectedLine(cell: CellInfo) {
        const {line: thisLine} = this;
        if (!thisLine) {
            throw new Error("Invalid operation - calling _reIndexConnectedLine() with no line");
        }

        const thisVector = cell.getRelativeCoords(this);

        cell.allowedLines.forEach((border) => {
            if (border === this) {
                return;
            }

            // Visit only straight lines for ice cells
            if (cell.isIce) {
                const otherVector = cell.getRelativeCoords(border);
                if (thisVector.bx !== -otherVector.bx || thisVector.by !== -otherVector.by) {
                    return;
                }
            }

            const {line: otherLine} = border;
            if (!otherLine) {
                return;
            }

            thisLine.group.merge(otherLine.group);
        });
    }

    setNoLine() {
        if (this.line === false) {
            return;
        }

        if (this.line !== undefined) {
            throw new Error(`Line is already set in setNoLine() of ${this.bx},${this.by}`);
        }

        this.line = false;

        // Important: first remove both allowed lines, only then apply the logic
        this.cells.start.removeAllowedLine(this, true);
        this.cells.end.removeAllowedLine(this);
        this.cells.start.applyLogic();

        this.applyLogic();
    }

    applyLogic() {
        const {start} = this.cells;

        if (this.line === undefined && !start.isIce && start.linesCount === 1) {
            let end: CellInfo | undefined = this.cells.end;
            const {bx, by} = this.cells.getVector();
            while (end && end.isIce) {
                end = this.solver.cells.get(end.bx + bx, end.by + by);
            }
            if (end && end.linesCount === 1) {
                const {group: {index: index1}} = start.allowedLines.values().map(({line}) => line).find(value => value) as LineInfo;
                const {group: {index: index2}} = end.allowedLines.values().map(({line}) => line).find(value => value) as LineInfo;
                // Avoid second loops and avoid closing the loop before visiting all cells
                if (index1 === index2 || (index1 < 2 && index2 < 2)) {
                    this.setNoLine();
                }
            }
        }
    }
}

class CellInfo extends Position {
    readonly isOutOfGrid: boolean;
    readonly isIce: boolean;
    readonly qnum?: number;
    readonly allowedLines = new CoordsMap<BorderInfo>();
    private _linesCount = 0;

    get linesCount() {
        return this._linesCount;
    }

    constructor(public solver: IcelomSolver, bx: number, by: number) {
        super(bx, by);

        const {cols, rows, cell: cells} = solver.icelom.board;
        const cell = cells[(by >> 1) * cols + (bx >> 1)];
        this.isOutOfGrid = bx < 0 || bx > 2 * cols || by < 0 || by > 2 * rows;
        this.isIce = !this.isOutOfGrid && cell.ques !== 0;
        this.qnum = !this.isOutOfGrid && cell.qnum > 0 ? cell.qnum : undefined;
    }

    public getRelativeCoords(position: Position) {
        return new Line<Position>(this, position).getVector();
    }

    addAllowedLine(border: BorderInfo) {
        const {bx, by} = this.getRelativeCoords(border);
        this.allowedLines.set(bx, by, border);
        // No logic to be applied here - we're on init phase
    }

    removeAllowedLine(border: BorderInfo, delayLogic = false) {
        const {bx, by} = this.getRelativeCoords(border);
        this.allowedLines.remove(bx, by);
        if (!delayLogic) {
            this.applyLogic();
        }
    }

    incrementLinesCount() {
        const newCount = ++this._linesCount;

        if (!this.isIce && newCount > 2) {
            throw new Error("Invalid cell - too many lines");
        }

        this.applyLogic();

        if (!this.isIce && newCount === 1) {
            this.solver.decrementEmptyLinesCount();
        }
    }

    applyLogic() {
        if (this.isOutOfGrid) {
            return;
        }

        if (this.isIce) {
            this.allowedLines.forEach((border, {bx, by}) => {
                const oppositeBorder = this.allowedLines.get(-bx, -by);
                if (!oppositeBorder) {
                    border.setNoLine();
                }

                if (border.line) {
                    if (!oppositeBorder) {
                        throw new Error("Invalid ice cell - line can't continue");
                    }

                    if (!oppositeBorder.line) {
                        new LineInfo(this.solver, oppositeBorder);
                    }
                }
            });
        } else {
            if (this.allowedLines.size < 2) {
                throw new Error("Invalid cell - less than 2 line segments");
            }

            if (this.allowedLines.size === 2) {
                this.allowedLines.forEach((border) => {
                    if (border.line === undefined) {
                        new LineInfo(this.solver, border);
                    }
                });
            }

            if (this._linesCount === 2) {
                this.allowedLines.forEach((border) => {
                    if (border.line === undefined) {
                        border.setNoLine();
                    }
                });
            }
        }
    }
}

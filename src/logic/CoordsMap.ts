import {Position} from "../pzpr-copy-paste/position";

export class CoordsMap<T> {
    private readonly _map: Record<number, Record<number, T>> = {};
    private _size = 0;

    get size() {
        return this._size;
    }

    get(x: number, y: number): T | undefined {
        return this._map[x]?.[y];
    }

    set(x: number, y: number, value: T) {
        this._map[x] = this._map[x] || {};
        if (this._map[x][y]) {
            return false;
        }
        this._map[x][y] = value;
        ++this._size;
        return true;
    }

    remove(x: number, y: number): T | undefined {
        if (this.get(x, y) === undefined) {
            return undefined;
        }

        delete this._map[x][y];
        if (Object.keys(this._map[x]).length === 0) {
            delete this._map[x];
        }
        --this._size;
    }

    keys(): Position[] {
        return Object.entries(this._map).flatMap(
            ([x, items]) => Object.keys(items).map(y => new Position(Number(x), Number(y)))
        );
    }

    values(): T[] {
        return Object.values(this._map).flatMap(Object.values);
    }

    entries(): [Position, T][] {
        return Object.entries(this._map).flatMap(
            ([x, items]) => Object.entries(items).map(
                ([y, item]): [Position, T] => [new Position(Number(x), Number(y)), item!]
            )
        );
    }

    // Modification-safe for-each loop
    forEach(action: (item: T, position: Position) => void) {
        for (const position of this.keys()) {
            const item = this.get(position.bx, position.by);
            if (item !== undefined) {
                action(item, position);
            }
        }
    }
}

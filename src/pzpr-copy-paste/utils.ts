export const indexes = (from: number, to?: number) => to === undefined
    ? [...Array(from).keys()]
    : [...Array(to - from).keys()].map(i => i + from);

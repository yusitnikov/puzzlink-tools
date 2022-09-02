import {useCallback, useState} from "react";

const parseHash = () => window.location.hash.substring(1).split("/");

export const useHash = (): [string[], (...parts: any[]) => void] => {
    const [hash, _setHash] = useState(parseHash);

    const setHash = useCallback((...parts: string[]) => {
        _setHash(parts);
        window.location.hash = "#" + parts.join("/");
    }, [_setHash]);

    return [hash, setHash];
};

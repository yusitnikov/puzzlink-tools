import {useHash} from "../hooks/useHash";
import {IcelomByAllParams} from "./pages/IcelomByAllParams";
import {IcelomByStrOnly} from "./pages/IcelomByStrOnly";

export const App = () => {
    const [hash, setHash] = useHash();

    if (hash.length === 3) {
        return <IcelomByAllParams hash={hash} setHash={setHash}/>;
    } else {
        return <IcelomByStrOnly hash={hash} setHash={setHash}/>;
    }
};

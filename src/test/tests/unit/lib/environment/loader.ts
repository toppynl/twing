import * as tape from "tape";
import {createEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader} from "../../../../../main/lib/loader/array";

tape('createEnvironment::loader', ({same, end}) => {
    const loader = createArrayLoader({});
    const environment = createEnvironment(loader);

    same(environment.loader, loader);

    end();
});

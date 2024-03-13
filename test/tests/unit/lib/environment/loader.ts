import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";

tape('createEnvironment::loader', ({same, end}) => {
    const loader = createArrayLoader({});
    const environment = createEnvironment(loader);

    same(environment.loader, loader);

    end();
});

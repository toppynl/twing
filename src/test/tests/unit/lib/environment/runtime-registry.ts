import tape from "tape";
import {createEnvironment, createSynchronousEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../main/lib/loader/array";

class FakeRuntime {
    readonly tag = "fake";
}

tape("environment.registerRuntime + getRuntime", ({test}) => {
    test("async: registered runtime is retrievable by constructor", ({equal, end}) => {
        const environment = createEnvironment(createArrayLoader({}));
        const instance = new FakeRuntime();
        environment.registerRuntime(instance);
        equal(environment.getRuntime(FakeRuntime), instance);
        end();
    });

    test("async: getRuntime throws when no runtime registered", ({throws, end}) => {
        const environment = createEnvironment(createArrayLoader({}));
        throws(() => environment.getRuntime(FakeRuntime), /no runtime registered/i);
        end();
    });

    test("sync: registered runtime is retrievable by constructor", ({equal, end}) => {
        const environment = createSynchronousEnvironment(createSynchronousArrayLoader({}));
        const instance = new FakeRuntime();
        environment.registerRuntime(instance);
        equal(environment.getRuntime(FakeRuntime), instance);
        end();
    });

    test("extension runtimes are auto-registered on addExtension", ({equal, end}) => {
        const environment = createEnvironment(createArrayLoader({}));
        const instance = new FakeRuntime();
        environment.addExtension({
            filters: [], functions: [], tests: [], operators: [],
            nodeVisitors: [], tagHandlers: [],
            runtimes: [instance]
        });
        equal(environment.getRuntime(FakeRuntime), instance);
        end();
    });
});

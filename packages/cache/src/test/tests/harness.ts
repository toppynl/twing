import tape, {Test} from "tape";
import {
    createArrayLoader,
    createEnvironment,
    createSynchronousArrayLoader,
    createSynchronousEnvironment
} from "@toppynl/twing";
import {
    createCacheExtension,
    createSynchronousCacheExtension,
    type TwingCacheAdapter,
    type TwingSynchronousCacheAdapter
} from "../../main/lib";

export type CacheCall = {
    key: string;
    ttl: number | null;
    executedBody: boolean;
};

export const createMockAdapter = (initialStore: Record<string, string> = {}) => {
    const store = new Map(Object.entries(initialStore));
    const calls: CacheCall[] = [];

    const adapter: TwingCacheAdapter = {
        get: async (key, ttl, compute) => {
            const hit = store.get(key);

            if (hit !== undefined) {
                calls.push({key, ttl, executedBody: false});
                return hit;
            }

            const value = await compute();
            store.set(key, value);
            calls.push({key, ttl, executedBody: true});
            return value;
        }
    };

    const syncAdapter: TwingSynchronousCacheAdapter = {
        get: (key, ttl, compute) => {
            const hit = store.get(key);

            if (hit !== undefined) {
                calls.push({key, ttl, executedBody: false});
                return hit;
            }

            const value = compute();
            store.set(key, value);
            calls.push({key, ttl, executedBody: true});
            return value;
        }
    };

    return {adapter, syncAdapter, store, calls};
};

export type CacheCase = {
    description: string;
    template: string;
    context?: Record<string, unknown>;
    expectation: string;
    prePopulated?: Record<string, string>;
    assertCalls?: (t: Test, calls: CacheCall[]) => void;
};

export const runCase = ({description, template, context, expectation, prePopulated, assertCalls}: CacheCase) => {
    tape(description, ({test}) => {
        test("asynchronously", async (t: Test) => {
            const {adapter, calls} = createMockAdapter(prePopulated ?? {});
            const environment = createEnvironment(createArrayLoader({"index.twig": template}));
            environment.addExtension(createCacheExtension(adapter));

            const actual = await environment.render("index.twig", context ?? {});

            t.equal(actual, expectation, `${description}: renders as expected (async)`);
            assertCalls?.(t, calls);
            t.end();
        });

        test("synchronously", (t: Test) => {
            const {syncAdapter, calls} = createMockAdapter(prePopulated ?? {});
            const environment = createSynchronousEnvironment(createSynchronousArrayLoader({"index.twig": template}));
            environment.addExtension(createSynchronousCacheExtension(syncAdapter));

            const actual = environment.render("index.twig", context ?? {});

            t.equal(actual, expectation, `${description}: renders as expected (sync)`);
            assertCalls?.(t, calls);
            t.end();
        });
    });
};

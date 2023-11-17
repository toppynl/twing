import * as tape from "tape";
import {createArrayLoader} from "../../../../../src/lib/loader/array";
import {stub} from "sinon";
import {createSource} from "../../../../../src/lib/source";
import {createRuntime} from "../../../../../src/lib/runtime";
import {createExtensionSet} from "../../../../../src/lib/extension-set";
import {TwingCache} from "../../../../../src/lib/cache";
import {TwingLoader} from "../../../../../src/lib/loader";

const createMockedLoader = (): TwingLoader => {
    return {
        getSourceContext() {
            return Promise.resolve(createSource('', ''));
        },
        getCacheKey() {
            return Promise.resolve('');
        },
        isFresh() {
            return Promise.resolve(true);
        },
        exists() {
            return Promise.resolve(true);
        },
        resolve() {
            return Promise.resolve(null);
        }
    };
};

const createMockCache = (): TwingCache => {
    return {
        generateKey: () => {
            return Promise.resolve('key');
        },
        write: () => {
            return Promise.resolve();
        },
        load: () => {
            return Promise.resolve(null);
        },
        getTimestamp: () => {
            return Promise.resolve(0);
        }
    };
};

tape('createRuntime ', ({test}) => {
    test('options', ({test}) => {
        test('autoReload', ({same, end}) => {
            const loader = createMockedLoader();
            const cache = createMockCache();

            const getRuntime = () => createRuntime(
                loader,
                {},
                createExtensionSet(),
                {
                    autoReload: true,
                    cache
                }
            );

            let count: number = -1;

            const cachedTemplates: Map<string, string> = new Map();

            stub(loader, "getSourceContext").callsFake(() => {
                return Promise.resolve(createSource(`${count}`, 'foo'));
            });

            const isFreshStub = stub(loader, "isFresh").callsFake(() => {
                count++;

                const isFresh = count !== 1;

                return Promise.resolve(isFresh);
            });
            const loadStub = stub(cache, "load").callsFake((key) => {
                return Promise.resolve(cachedTemplates.get(key) || null);
            });
            const writeStub = stub(cache, "write").callsFake((key, content) => {
                return Promise.resolve(cachedTemplates.set(key, content));
            });

            return getRuntime().loadTemplate('foo')
                .then(() => {
                    return getRuntime().loadTemplate('foo');
                })
                .then(() => {
                    return getRuntime().loadTemplate('foo');
                })
                .then((template) => {
                    return template?.render({});
                })
                .then((content) => {
                    same(content, '1');
                    same(isFreshStub.callCount, 3);
                    same(loadStub.callCount, 2);
                    same(writeStub.callCount, 2);
                })
                .finally(end);
        });
    });

    test('on', ({test}) => {
        test('load', ({same, end}) => {
            const runtime = createRuntime(
                createArrayLoader({
                    foo: '{{ include("bar") }}',
                    bar: 'bar'
                }), 
                {}, 
                createExtensionSet(), 
                {}
            );

            const loadedTemplates: Array<string> = [];

            runtime.on("load", (template) => {
                loadedTemplates.push(template);
            });

            return runtime.loadTemplate('foo')
                .then(() => {
                    same(loadedTemplates, ['foo']);
                })
                .finally(end);
        });
    });
});

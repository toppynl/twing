import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";
import {Settings} from "luxon";
import {spy, stub} from "sinon";
import {createSource} from "../../../../../src/lib/source";
import {TwingCache} from "../../../../../src/lib/cache";
import {TwingTemplateNode} from "../../../../../src/lib/node/template";

const createMockCache = (): TwingCache => {
    return {
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

// todo: unit test every property because this is the public API
import "./load-template";

tape('createEnvironment ', ({test}) => {
    test('options', ({test}) => {
        test('apply default values', ({same, end}) => {
            Settings.defaultZoneName = "Europe/Paris";

            const environment = createEnvironment(createArrayLoader({}));

            same(environment.isStrictVariables, false);
            same(environment.charset, 'UTF-8');
            same(environment.dateFormat, 'F j, Y H:i');
            same(environment.numberFormat, {
                decimalPoint: '.',
                numberOfDecimals: 0,
                thousandSeparator: ','
            });
            same(environment.timezone, 'Europe/Paris');

            end();
        });

        test('autoReload', ({test}) => {
            test('when enabled', ({same, end}) => {
                const loader = createArrayLoader({
                    foo: 'bar'
                });
                const cache = createMockCache();

                const getEnvironment = () => createEnvironment(
                    loader,
                    {
                        autoReload: true,
                        cache
                    }
                );

                let count: number = -1;

                const cachedTemplates: Map<string, TwingTemplateNode> = new Map();

                stub(loader, "getSource").callsFake(() => {
                    return Promise.resolve(createSource('foo', `${count}`));
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
                    cachedTemplates.set(key, content);

                    return Promise.resolve();
                });

                return getEnvironment().loadTemplate('foo')
                    .then(() => {
                        return getEnvironment().loadTemplate('foo');
                    })
                    .then(() => {
                        return getEnvironment().loadTemplate('foo');
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

            test('when disabled, always hit the cache', ({test}) => {
                const testCases = [false, undefined];

                for (const testCase of testCases) {
                    test(`${testCase === undefined ? 'default' : 'false'}`, ({same, end}) => {
                        const loader = createArrayLoader({
                            foo: 'bar'
                        });

                        const cache = createMockCache();

                        const getEnvironment = () => createEnvironment(
                            loader,
                            {
                                autoReload: testCase,
                                cache
                            }
                        );

                        let count: number = -1;

                        const cachedTemplates: Map<string, TwingTemplateNode> = new Map();

                        stub(loader, "getSource").callsFake(() => {
                            return Promise.resolve(createSource('foo', `${count}`));
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
                            cachedTemplates.set(key, content);

                            return Promise.resolve();
                        });

                        return getEnvironment().loadTemplate('foo')
                            .then(() => {
                                return getEnvironment().loadTemplate('foo');
                            })
                            .then(() => {
                                return getEnvironment().loadTemplate('foo');
                            })
                            .then((template) => {
                                return template?.render({});
                            })
                            .then((content) => {
                                same(content, '-1');
                                same(isFreshStub.callCount, 0);
                                same(loadStub.callCount, 3);
                                same(writeStub.callCount, 1);
                            })
                            .finally(end);
                    });
                }
            });

            test('when no options is passed', ({same, end}) => {
                const loader = createArrayLoader({
                    foo: 'bar'
                });

                const getEnvironment = () => createEnvironment(
                    loader
                );

                const isFreshStub = stub(loader, "isFresh").callsFake(() => {
                    return Promise.resolve(false);
                });

                return getEnvironment().loadTemplate('foo')
                    .then(() => {
                        return getEnvironment().loadTemplate('foo');
                    })
                    .then(() => {
                        return getEnvironment().loadTemplate('foo');
                    })
                    .then((template) => {
                        return template?.render({});
                    })
                    .then(() => {
                        same(isFreshStub.callCount, 0);
                    })
                    .finally(end);
            });
        });
    });

    test('render', ({test}) => {
        test('throws on not found template', ({same, fail, end}) => {
            const environment = createEnvironment(
                createArrayLoader({})
            );

            return environment.render('foo', {})
                .then(() => fail)
                .catch((error: any) => {
                    same((error as Error).name, 'TwingTemplateLoadingError');
                    same((error as Error).message, 'Unable to find template "foo".');
                })
                .finally(end);
        })
    });

    test('on', ({test}) => {
        test('load', ({same, end}) => {
            const environment = createEnvironment(
                createArrayLoader({
                    foo: '{{ include("bar") }}',
                    bar: 'bar'
                }),
                {}
            );

            const loadedTemplates: Array<string> = [];

            environment.on("load", (template) => {
                loadedTemplates.push(template);
            });

            return environment.loadTemplate('foo')
                .then(() => {
                    same(loadedTemplates, ['foo']);
                })
                .finally(end);
        });
    });

    test('loadTemplate', ({test}) => {
        test('always hits the internal cache', ({same, end}) => {
            const loader = createArrayLoader({
                foo: 'bar'
            });
            const cache = createMockCache();

            const getEnvironment = () => createEnvironment(
                loader,
                {
                    cache
                }
            );

            const getSourceContextSpy = spy(loader, "getSource");

            const environment = getEnvironment();

            return environment.loadTemplate('foo')
                .then(() => {
                    return environment.loadTemplate('foo');
                })
                .then(() => {
                    return environment.loadTemplate('foo');
                })
                .then((template) => {
                    return template?.render({});
                })
                .then((content) => {
                    same(content, 'bar');
                    same(getSourceContextSpy.callCount, 1);
                })
                .finally(end);
        });
    });
});

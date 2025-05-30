import * as tape from "tape";
import {createEnvironment, createSynchronousEnvironment} from "../../../../../main/lib/environment";
import {
    createFilesystemLoader,
    createSynchronousFilesystemLoader,
    TwingFilesystemLoaderFilesystem, TwingSynchronousFilesystemLoaderFilesystem
} from "../../../../../main/lib/loader/filesystem";
import {spy, stub} from "sinon";
import {createSynchronousTemplateLoader, createTemplateLoader} from "../../../../../main/lib/template-loader";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../main/lib/loader/array";
import type {TwingCache, TwingSynchronousCache} from "../../../../../main/lib/cache";
import {createTemplateNode, type TwingTemplateNode} from "../../../../../main/lib/node/template";
import {createBaseNode} from "../../../../../main/lib/node";
import {createSource} from "../../../../../main/lib/source";

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

const createMockSynchronousCache = (): TwingSynchronousCache => {
    return {
        write: () => {
            return;
        },
        load: () => {
            return null;
        },
        getTimestamp: () => {
            return 0;
        }
    };
};

tape('createTemplateLoader::()', ({test}) => {
    test('cache the loaded template under it fully qualified name', ({same, end}) => {
        const fileSystem: TwingFilesystemLoaderFilesystem = {
            readFile(_path, callback) {
                callback(null, Buffer.from(''));
            },
            stat(path, callback) {
                callback(null, path === 'foo/bar' ? {
                    isFile() {
                        return true;
                    },
                    mtime: new Date(0)
                } : null);
            }
        };
        const loader = createFilesystemLoader(fileSystem);

        loader.addPath('foo', '@Foo');
        loader.addPath('foo', 'Bar');

        const environment = createEnvironment(loader);
        const loadTemplate = createTemplateLoader(environment);

        const getSourceSpy = spy(loader, "getSource");

        return loadTemplate('@Foo/bar', null)
            .then(() => {
                return Promise.all([
                    loadTemplate('foo/bar', null),
                    loadTemplate('./foo/bar', null),
                    loadTemplate('../foo/bar', 'there/index.html'),
                    loadTemplate('Bar/bar', null),
                ]).then(() => {
                    same(getSourceSpy.callCount, 1);
                });
            })
            .finally(end);
    });

    test('hits the loader when the templates is considered as dirty', ({same, end}) => {
        const loader = createArrayLoader({
            foo: 'bar'
        });
        const cache = createMockCache();

        stub(loader, "isFresh").resolves(false);

        const loadSpy = spy(cache, "load");
        const getSourceSpy = spy(loader, "getSource");

        const environment = createEnvironment(
            loader,
            {
                cache
            }
        );
        const loadTemplate = createTemplateLoader(environment);

        return loadTemplate('foo', null)
            .then(() => {
                return loadTemplate('foo', null);
            })
            .then(() => {
                return loadTemplate('foo', null);
            })
            .then((template) => {
                return template?.render(environment, {});
            })
            .then((content) => {
                same(content, 'bar');
                same(loadSpy.callCount, 0);
                same(getSourceSpy.callCount, 1);
            })
            .finally(end);
    });

    test('hits the cache when the templates is considered as fresh', ({same, end}) => {
        const loader = createArrayLoader({
            foo: 'bar'
        });
        const cache = createMockCache();

        const loadSpy = spy(cache, "load");
        const getSourceSpy = spy(loader, "getSource");

        const environment = createEnvironment(
            loader,
            {
                cache
            }
        );
        const loadTemplate = createTemplateLoader(environment);

        return loadTemplate('foo', null)
            .then(() => {
                return loadTemplate('foo', null);
            })
            .then(() => {
                stub(loader, "isFresh").resolves(true);

                return loadTemplate('foo', null);
            })
            .then((template) => {
                return template?.render(environment, {});
            })
            .then((content) => {
                same(content, 'bar');
                same(loadSpy.callCount, 1);
                same(getSourceSpy.callCount, 1);
            })
            .finally(end);
    });

    test('does not hit the loader when the templates is retrieved from the cache', ({same, end}) => {
        const loader = createArrayLoader({
            foo: 'bar'
        });
        const cache = createMockCache();

        stub(cache, "load").resolves(createTemplateNode(
            createBaseNode(null),
            null,
            createBaseNode(null),
            createBaseNode(null),
            createBaseNode(null),
            new Array<TwingTemplateNode>(),
            createSource('foo', 'bar'),
            0, 0
        ));

        const getSourceSpy = spy(loader, "getSource");

        const environment = createEnvironment(
            loader,
            {
                cache
            }
        );
        const loadTemplate = createTemplateLoader(environment);

        return loadTemplate('foo', null)
            .then(() => {
                same(getSourceSpy.callCount, 0);

            })
            .finally(end);
    });
});

tape('createTemplateLoader::()', ({test}) => {
    test('cache the loaded template under it fully qualified name', ({same, end}) => {
        const fileSystem: TwingSynchronousFilesystemLoaderFilesystem = {
            readFileSync(_path) {
                return Buffer.from('');
            },
            statSync(path) {
                return path === 'foo/bar' ? {
                    isFile() {
                        return true;
                    },
                    mtime: new Date(0)
                } : null;
            }
        };
        const loader = createSynchronousFilesystemLoader(fileSystem);

        loader.addPath('foo', '@Foo');
        loader.addPath('foo', 'Bar');

        const environment = createSynchronousEnvironment(loader);
        const loadTemplate = createSynchronousTemplateLoader(environment);

        const getSourceSpy = spy(loader, "getSource");

        loadTemplate('@Foo/bar', null);
        loadTemplate('foo/bar', null);
        loadTemplate('./foo/bar', null);
        loadTemplate('../foo/bar', 'there/index.html');
        loadTemplate('Bar/bar', null);
        
        same(getSourceSpy.callCount, 1);
        
        end();
    });

    test('hits the loader when the templates is considered as dirty', ({same, end}) => {
        const loader = createSynchronousArrayLoader({
            foo: 'bar'
        });
        const cache = createMockSynchronousCache();

        stub(loader, "isFresh").returns(false);

        const loadSpy = spy(cache, "load");
        const getSourceSpy = spy(loader, "getSource");

        const environment = createSynchronousEnvironment(
            loader,
            {
                cache
            }
        );
        const loadTemplate = createSynchronousTemplateLoader(environment);

        loadTemplate('foo', null);
        loadTemplate('foo', null);
        
        const template = loadTemplate('foo', null);
        
        const content = template?.render(environment, new Map());
        
        same(content, 'bar');
        same(loadSpy.callCount, 0);
        same(getSourceSpy.callCount, 1);
                
        end();
    });

    test('hits the cache when the templates is considered as fresh', ({same, end}) => {
        const loader = createSynchronousArrayLoader({
            foo: 'bar'
        });
        const cache = createMockSynchronousCache();

        const loadSpy = spy(cache, "load");
        const getSourceSpy = spy(loader, "getSource");

        const environment = createSynchronousEnvironment(
            loader,
            {
                cache
            }
        );
        const loadTemplate = createSynchronousTemplateLoader(environment);

        loadTemplate('foo', null);
        loadTemplate('foo', null);
        
        stub(loader, "isFresh").returns(true);

        const template = loadTemplate('foo', null);
        const content = template?.render(environment, new Map());

        same(content, 'bar');
        same(loadSpy.callCount, 1);
        same(getSourceSpy.callCount, 1);
        
        end();  
    });

    test('does not hit the loader when the templates is retrieved from the cache', ({same, end}) => {
        const loader = createSynchronousArrayLoader({
            foo: 'bar'
        });
        const cache = createMockSynchronousCache();

        stub(cache, "load").returns(createTemplateNode(
            createBaseNode(null),
            null,
            createBaseNode(null),
            createBaseNode(null),
            createBaseNode(null),
            new Array<TwingTemplateNode>(),
            createSource('foo', 'bar'),
            0, 0
        ));

        const getSourceSpy = spy(loader, "getSource");

        const environment = createSynchronousEnvironment(
            loader,
            {
                cache
            }
        );
        const loadTemplate = createSynchronousTemplateLoader(environment);

        loadTemplate('foo', null);

        same(getSourceSpy.callCount, 0);

        end();
    });
});

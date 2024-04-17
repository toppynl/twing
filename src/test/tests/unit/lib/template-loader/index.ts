import * as tape from "tape";
import {createEnvironment} from "../../../../../main/lib/environment";
import {createFilesystemLoader, TwingFilesystemLoaderFilesystem} from "../../../../../main/lib/loader/filesystem";
import {spy, stub} from "sinon";
import {createTemplateLoader} from "../../../../../main/lib/template-loader";
import {createArrayLoader} from "../../../../../main/lib/loader/array";
import type {TwingCache} from "../../../../../main/lib/cache";

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
});

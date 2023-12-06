import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createFilesystemLoader, TwingFilesystemLoaderFilesystem} from "../../../../../src/lib/loader/filesystem";
import {spy} from "sinon";
import {createArrayLoader} from "../../../../../src/lib/loader/array";

tape('createEnvironment::loadTemplate', ({test}) => {
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

        const getSourceSpy = spy(loader, "getSource");

        return environment.loadTemplate('@Foo/bar')
            .then(() => {
                return Promise.all([
                    environment.loadTemplate('foo/bar'),
                    environment.loadTemplate('./foo/bar'),
                    environment.loadTemplate('../foo/bar', 'there/index.html'),
                    environment.loadTemplate('Bar/bar'),
                ]).then(() => {
                    same(getSourceSpy.callCount, 1);
                });
            })
            .finally(end);
    });

    test('emits a "load" event', ({same, end}) => {
        const environment = createEnvironment(createArrayLoader({
            index: `{{ include("partial") }}`,
            partial: ``
        }));

        const loadedTemplates: Array<[string, string | null]> = [];

        environment.on("load", (name, from) => {
            loadedTemplates.push([name, from]);
        });

        return environment.loadTemplate(('index'))
            .then((template) => {
                return template.render({});
            })
            .then(() => {
                same(loadedTemplates, [
                    ['index', null],
                    ['partial', 'index']
                ]);
            })
            .finally(end);
    });
});

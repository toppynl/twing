import tape from "tape";
import {
    createFilesystemLoader,
    createSynchronousFilesystemLoader,
    TwingFilesystemLoaderFilesystem, TwingSynchronousFilesystemLoaderFilesystem
} from "../../../../../../main/lib/loader/filesystem";
import {createSource} from "../../../../../../main/lib/source";
import {stub} from "sinon";

const fileSystemContent: Array<[path: string, content: string]> = [
    ['index.html', 'index.html content'],
    ['foo/index.html','foo/index.html content'],
    ['bar/index.html', 'bar/index.html content'],
    ['/foo/index.html', '/foo/index.html content'],
    ['views/index.html', 'views/index.html content'],
    ['views/index2.html', 'views/index2.html content'],
    ['views/foo.html', 'views/foo.html content'],
    ['views/foo2.html', 'views/foo2.html content'],
    ['templates/bar.html', 'templates/bar.html content'],
    ['templates/bar2.html', 'templates/bar2.html content'],
    ['views2/foo2.html', 'views2/foo2.html content'],
    ['templates2/bar2.html', 'templates2/bar2.html content'],
    ['views/partials/index.html', 'views/partials/index.html content']
];

const createFilesystem = (): TwingFilesystemLoaderFilesystem => {
    return {
        stat: (path, callback) => {
            const entry = fileSystemContent.find((file) => {
                return file[0] === path;
            });

            if (entry) {
                callback(null, {
                    isFile() {
                        return true;
                    },
                    mtime: new Date()
                });
            } else {
                callback(new Error(`${path} not found`), null);
            }
        },
        readFile: (path, callback) => {
            const entry = fileSystemContent.find((file) => {
                return file[0] === path;
            });

            if (entry) {
                callback(null, Buffer.from(entry[1]));
            } else {
                callback(new Error(`${path} not found`), null);
            }
        }
    };
};

const createSynchronousFilesystem = (): TwingSynchronousFilesystemLoaderFilesystem => {
    return {
        statSync: (path) => {
            const entry = fileSystemContent.find((file) => {
                return file[0] === path;
            });

            if (entry) {
                return {
                    isFile() {
                        return true;
                    },
                    mtime: new Date()
                };
            } else {
                throw new Error(`${path} not found`);
            }
        },
        readFileSync: (path) => {
            const entry = fileSystemContent.find((file) => {
                return file[0] === path;
            });

            if (entry) {
                return Buffer.from(entry[1]);
            } else {
                throw new Error(`${path} not found`);
            }
        }
    };
};

tape('createFilesystemLoader', ({test}) => {
    test('resolve', async ({same, end}) => {
        const filesystem = createFilesystem();
        
        let loader = createFilesystemLoader(filesystem);

        loader.addPath('views');
        loader.addPath('foo', 'Foo');
        loader.addPath('foo', '@Foo');
        loader.addPath('bar', 'Foo');
        loader.prependPath('foo', 'Bar');
        loader.prependPath('bar', 'Bar');

        same(await loader.resolve('index.html', null), 'views/index.html');
        same(await loader.resolve('./index.html', null), 'index.html');
        same(await loader.resolve('foo/index.html', null), null);
        same(await loader.resolve('Foo/index.html', null), 'foo/index.html');
        same(await loader.resolve('@Foo/index.html', null), 'foo/index.html');
        same(await loader.resolve('Bar/index.html', null), 'bar/index.html');
        same(await loader.resolve('./foo/index.html', null), 'foo/index.html');
        same(await loader.resolve('../foo/index.html', 'bar/index.html'), 'foo/index.html');
        same(await loader.resolve('/foo/index.html', null), '/foo/index.html');
        same(await loader.resolve('/foo/index.html', 'bar/index.html'), '/foo/index.html');
        same(await loader.resolve('missing.html', null), null);
        same(await loader.resolve('./missing.html', null), null);
        same(await loader.resolve('./foo/missing.html', null), null);
        same(await loader.resolve('../foo/index.html', 'index.html'), null);
        same(await loader.resolve('partials/index.html', null), 'views/partials/index.html');

        loader = createFilesystemLoader(filesystem);

        loader.addPath('views');
        loader.prependPath('views2');
        loader.addPath('templates', null);
        loader.prependPath('templates2', null);

        same(await loader.resolve('index2.html', null), 'views/index2.html');
        same(await loader.resolve('foo.html', null), 'views/foo.html');
        same(await loader.resolve('bar.html', null), 'templates/bar.html');
        same(await loader.resolve('foo2.html', null), 'views2/foo2.html');
        same(await loader.resolve('bar2.html', null), 'templates2/bar2.html');
        same(await loader.resolve('index.html', null), 'views/index.html');

        end();
    });

    test('exists', async ({same, end}) => {
        const filesystem = createFilesystem();
        const loader = createFilesystemLoader(filesystem);

        loader.addPath('foo', 'Foo');
        loader.addPath('foo', '@Foo');

        same(await loader.exists('foo/index.html', null), true);
        same(await loader.exists('Foo/index.html', null), true);
        same(await loader.exists('@Foo/index.html', null), true);
        same(await loader.exists('./foo/index.html', null), true);
        same(await loader.exists('../foo/index.html', 'bar/index.html'), true);
        same(await loader.exists('./foo/missing.html', null), false);
        same(await loader.exists('../foo/index.html', 'index.html'), false);

        end();
    });

    test('getSource', ({test}) => {
        test('returns a source or null', async ({same, end}) => {
            const filesystem = createFilesystem();
            const loader = createFilesystemLoader(filesystem);

            loader.addPath('foo', 'Foo');
            loader.addPath('foo', '@Foo');

            const expectation = createSource('foo/index.html', 'foo/index.html content');

            same(await loader.getSource('foo/index.html', null), expectation);
            same(await loader.getSource('Foo/index.html', null), expectation);
            same(await loader.getSource('@Foo/index.html', null), expectation);
            same(await loader.getSource('./foo/index.html', null), expectation);
            same(await loader.getSource('../foo/index.html', 'bar/index.html'), expectation);
            same(await loader.getSource('./foo/missing.html', null), null);
            same(await loader.getSource('../foo/index.html', 'index.html'), null);

            end();
        });

        test('propagates filesystem read errors', ({fail, same, end}) => {
            const filesystem = createFilesystem();
            const loader = createFilesystemLoader(filesystem);

            stub(filesystem, "readFile").callsFake((_path, callback) => {
                callback(new Error('I am Error'), null);
            });

            return loader.getSource('foo/index.html', null)
                .then(() => fail())
                .catch((error) => {
                    same((error as Error).message, 'I am Error');
                })
                .finally(end);
        });
    });

    test('isFresh', ({test}) => {
        test('returns true for non-existing template', async ({same, end}) => {
            const filesystem = createFilesystem();
            const loader = createFilesystemLoader(filesystem);

            stub(filesystem, "stat").callsFake((_path, callback) => {
                callback(null, null);
            });

            return loader.isFresh('foo/index.html', 1, null)
                .then((isFresh) => same(isFresh, true))
                .finally(end);
        });

        test('returns true on templates modified before the passed date', ({same, end}) => {
            const filesystem = createFilesystem();
            const loader = createFilesystemLoader(filesystem);

            stub(filesystem, "stat").callsFake((_path, callback) => {
                callback(null, {
                    isFile() {
                        return true;
                    },
                    mtime: new Date(0)
                });
            });

            return loader.isFresh('foo/index.html', 1, null)
                .then((isFresh) => same(isFresh, true))
                .finally(end);
        });

        test('returns false on templates modified before the passed date', ({same, end}) => {
            const filesystem = createFilesystem();
            const loader = createFilesystemLoader(filesystem);

            stub(filesystem, "stat").callsFake((_path, callback) => {
                callback(null, {
                    isFile() {
                        return true;
                    },
                    mtime: new Date(2)
                });
            });

            return loader.isFresh('foo/index.html', 1, null)
                .then((isFresh) => same(isFresh, false))
                .finally(end);
        });
    });
});

tape('createSynchronousFilesystemLoader', ({test}) => {
    test('resolve', async ({same, end}) => {
        const filesystem = createSynchronousFilesystem();

        let loader = createSynchronousFilesystemLoader(filesystem);

        loader.addPath('foo', 'Foo');
        loader.addPath('foo', '@Foo');
        loader.addPath('bar', 'Foo');
        loader.prependPath('foo', 'Bar');
        loader.prependPath('bar', 'Bar');

        same(await loader.resolve('index.html', null), 'index.html');
        same(await loader.resolve('./index.html', null), 'index.html');
        same(await loader.resolve('foo/index.html', null), 'foo/index.html');
        same(await loader.resolve('Foo/index.html', null), 'foo/index.html');
        same(await loader.resolve('@Foo/index.html', null), 'foo/index.html');
        same(await loader.resolve('Bar/index.html', null), 'bar/index.html');
        same(await loader.resolve('./foo/index.html', null), 'foo/index.html');
        same(await loader.resolve('../foo/index.html', 'bar/index.html'), 'foo/index.html');
        same(await loader.resolve('/foo/index.html', null), '/foo/index.html');
        same(await loader.resolve('/foo/index.html', 'bar/index.html'), '/foo/index.html');
        same(await loader.resolve('missing.html', null), null);
        same(await loader.resolve('./missing.html', null), null);
        same(await loader.resolve('./foo/missing.html', null), null);
        same(await loader.resolve('../foo/index.html', 'index.html'), null);

        loader = createSynchronousFilesystemLoader(filesystem);

        loader.addPath('views');
        loader.prependPath('views2');
        loader.addPath('templates', null);
        loader.prependPath('templates2', null);

        same(await loader.resolve('index2.html', null), 'views/index2.html');
        same(await loader.resolve('foo.html', null), 'views/foo.html');
        same(await loader.resolve('bar.html', null), 'templates/bar.html');
        same(await loader.resolve('foo2.html', null), 'views2/foo2.html');
        same(await loader.resolve('bar2.html', null), 'templates2/bar2.html');
        same(await loader.resolve('index.html', null), 'views/index.html');

        end();
    });

    test('exists', async ({same, end}) => {
        const filesystem = createSynchronousFilesystem();
        const loader = createSynchronousFilesystemLoader(filesystem);

        loader.addPath('foo', 'Foo');
        loader.addPath('foo', '@Foo');

        same(await loader.exists('foo/index.html', null), true);
        same(await loader.exists('Foo/index.html', null), true);
        same(await loader.exists('@Foo/index.html', null), true);
        same(await loader.exists('./foo/index.html', null), true);
        same(await loader.exists('../foo/index.html', 'bar/index.html'), true);
        same(await loader.exists('./foo/missing.html', null), false);
        same(await loader.exists('../foo/index.html', 'index.html'), false);

        end();
    });

    test('getSource', ({test}) => {
        test('returns a source or null', async ({same, end}) => {
            const filesystem = createSynchronousFilesystem();
            const loader = createSynchronousFilesystemLoader(filesystem);

            loader.addPath('foo', 'Foo');
            loader.addPath('foo', '@Foo');

            const expectation = createSource('foo/index.html', 'foo/index.html content');

            same(await loader.getSource('foo/index.html', null), expectation);
            same(await loader.getSource('Foo/index.html', null), expectation);
            same(await loader.getSource('@Foo/index.html', null), expectation);
            same(await loader.getSource('./foo/index.html', null), expectation);
            same(await loader.getSource('../foo/index.html', 'bar/index.html'), expectation);
            same(await loader.getSource('./foo/missing.html', null), null);
            same(await loader.getSource('../foo/index.html', 'index.html'), null);

            end();
        });

        test('propagates filesystem read errors', ({fail, same, end}) => {
            const filesystem = createFilesystem();
            const loader = createFilesystemLoader(filesystem);

            stub(filesystem, "readFile").callsFake((_path, callback) => {
                callback(new Error('I am Error'), null);
            });

            return loader.getSource('foo/index.html', null)
                .then(() => fail())
                .catch((error) => {
                    same((error as Error).message, 'I am Error');
                })
                .finally(end);
        });
    });

    test('isFresh', ({test}) => {
        test('returns true for non-existing template', async ({same, end}) => {
            const filesystem = createSynchronousFilesystem();
            const loader = createSynchronousFilesystemLoader(filesystem);

            stub(filesystem, "statSync").callsFake((_path) => {
                return null;
            });

            const isFresh = loader.isFresh('foo/index.html', 1, null);
            
            same(isFresh, true);
            
            end();
        });

        test('returns true on templates modified before the passed date', ({same, end}) => {
            const filesystem = createSynchronousFilesystem();
            const loader = createSynchronousFilesystemLoader(filesystem);

            stub(filesystem, "statSync").callsFake((_path) => {
                return {
                    isFile() {
                        return true;
                    },
                    mtime: new Date(0)
                };
            });

            const isFresh = loader.isFresh('foo/index.html', 1, null);
            
            same(isFresh, true);
            
            end();
        });

        test('returns false on templates modified before the passed date', ({same, end}) => {
            const filesystem = createSynchronousFilesystem();
            const loader = createSynchronousFilesystemLoader(filesystem);

            stub(filesystem, "statSync").callsFake((_path) => {
                return {
                    isFile() {
                        return true;
                    },
                    mtime: new Date(2)
                };
            });

            const isFresh = loader.isFresh('foo/index.html', 1, null);
            
            same(isFresh, false);
            
            end();
        });
    });
});

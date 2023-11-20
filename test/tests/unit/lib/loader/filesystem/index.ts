import * as tape from 'tape';
import {
    createFilesystemLoader,
    TwingFilesystemLoaderFilesystem,
    MAIN_NAMESPACE
} from "../../../../../../src/lib/loader/filesystem";
import {resolve, join, relative, isAbsolute} from "path";
import {spy, stub} from "sinon";
import {createSource} from "../../../../../../src/lib/source";
import {TwingLoader} from "../../../../../../src/lib/loader";
import {createEnvironment, TwingEnvironment, TwingEnvironmentOptions} from "../../../../../../src/lib/environment";

const fixturesPath = 'fixtures';

const directories: Array<string> = [
    fixturesPath,
    '/fixtures',
    'fixtures/normal_one',
    'fixtures/normal_two',
    'fixtures/normal_three',
    'fixtures/normal_four',
    'fixtures/named_one',
    'fixtures/named_two',
    'fixtures/named_three',
    'fixtures/named_four',
    'fixtures/named_five'
];

const templates: Array<[path: string, content: string]> = [
    ['/fixtures/named_one/index.html', `named path`],
    ['fixtures/embed/layout/embed.html.twig', `Hello {% block content "base"%}!`],
    ['fixtures/embed/index.html.twig', `{% embed "embed/layout/embed.html.twig" %}
    {% block content "world"%}
{% endembed %}
{% embed "embed/../embed/layout/embed.html.twig" %}
    {% block content "world"%}
{% endembed %}`],
    ['fixtures/inheritance/array_inheritance_empty_parent.html.twig', `{% extends ['','parent.html.twig'] %}

{% block body %}{{ parent() }} Child{% endblock %}`],
    ['fixtures/inheritance/array_inheritance_nonexistent_parent.html.twig', `{% extends ['fixtures/nonexistent.html.twig','parent.html.twig'] %}

{% block body %}{{ parent() }} Child{% endblock %}`],
    ['fixtures/inheritance/array_inheritance_null_parent.html.twig', `{% extends [null,'parent.html.twig'] %}

{% block body %}{{ parent() }} Child{% endblock %}`],
    ['fixtures/inheritance/array_inheritance_valid_parent.html.twig', `{% extends ['fixtures/parent.html.twig','spare_parent.html.twig'] %}

{% block body %}{{ parent() }} Child{% endblock %}`],
    ['fixtures/inheritance/parent.html.twig', `{% block body %}VALID{% endblock %}`],
    ['fixtures/inheritance/spare_parent.html.twig', `{% block body %}SPARE PARENT{% endblock %}`],
    ['fixtures/named_one/index.html', `named path`],
    ['fixtures/named_two/index.html', `named path (two)`],
    ['fixtures/named_five/index.html', `named path (five)`],
    ['fixtures/named_four/named_absolute.html', `named path (four)`],
    ['fixtures/named_three/index.html', `named path (three)`],
    ['fixtures/normal_one/index.html', `normal (one)`],
    ['fixtures/normal_two/index.html', `normal (two)`],
    ['fixtures/normal_four/index.html', `normal (four)`],
    ['fixtures/normal_three/index.html', `normal (three)`],
    ['fixtures/themes/theme1/blocks.html.twig', `{% block b1 %}block from theme 1{% endblock %}

{% block b2 %}block from theme 1{% endblock %}`],
    ['fixtures/themes/theme2/blocks.html.twig', `{% use '@default_theme/blocks.html.twig' %}

{% block b2 %}block from theme 2{% endblock %}`],
    ['fixtures/themes/theme3/blocks.html.twig', `{% use '../theme1/blocks.html.twig' %}

{% block b2 %}block from theme 3{% endblock %}`],
    ['fixtures/errors/base.html', `{% block content %}{% endblock %}`],
    ['fixtures/errors/index.html', `{% extends 'base.html' %}
{% block content %}
{{ foo.bar }}
{% endblock %}
{% block foo %}
{{ foo.bar }}
{% endblock %}`]
];

const basePaths: Array<[basePath: string, cacheKey: string, rootPath: string | null]> = [
    [
        fixturesPath,
        'fixtures/named_four/named_absolute.html',
        null
    ],
    [
        join(fixturesPath, '../fixtures'),
        'fixtures/named_four/named_absolute.html',
        null
    ],
    [
        fixturesPath,
        'fixtures/named_four/named_absolute.html',
        '.'
    ],
    [
        join(fixturesPath, '../fixtures'),
        'fixtures/named_four/named_absolute.html',
        '.'
    ],
];

const stats = {
    isDirectory: () => isDirectory,
    isFile: () => isFile,
    get mtime() {
        return mtime
    }
};

let isFile: boolean = false;
let isDirectory: boolean = false;
let mtime: Date = new Date(1);

const createFilesystem = () => {
    const filesystem: TwingFilesystemLoaderFilesystem = {
        readFile: (path, callback) => {
            const template = templates.find(([templatePath]) => {
                const resolvedTemplatePath = resolve(templatePath);

                return resolvedTemplatePath === path;
            });

            callback(null, Buffer.from(template ? template[1] : ''));
        },
        stat: (path, callback) => {
            const filesystemPath = isAbsolute(path) ? path : relative(resolve('.'), path);

            const template = templates.find(([templatePath]) => {
                return templatePath === filesystemPath;
            });

            isFile = template !== undefined;

            const directory = directories.find((directory) => {
                return directory === filesystemPath;
            });

            isDirectory = directory !== undefined;

            callback(null, stats);
        }
    };

    return filesystem;
};

tape('loader filesystem', ({test}) => {
    test('constructor', (test) => {
        let loader = createFilesystemLoader(createFilesystem(), []);

        test.same(loader.getPaths(), []);

        test.end();
    });

    test('paths', async ({same, end}) => {
        for (const [basePath, cacheKey, rootPath] of basePaths) {
            const loader = createFilesystemLoader(createFilesystem(), [
                join(basePath, 'normal_one'),
                join(basePath, 'normal_two')
            ], rootPath);
            loader.addPath(join(basePath, 'normal_three'));
            loader.prependPath(join(basePath, 'normal_four'));

            loader.setPaths([
                join(basePath, 'named_one'),
                join(basePath, 'named_two')
            ], 'named');
            loader.addPath(join(basePath, 'named_three'), 'named');
            loader.prependPath(join(basePath, 'named/../named_four'), 'named');
            loader.prependPath(join(basePath, 'named_five'), 'named');

            same([
                join(basePath, 'normal_four'),
                join(basePath, 'normal_one'),
                join(basePath, 'normal_two'),
                join(basePath, 'normal_three')
            ], loader.getPaths());

            same([
                join(basePath, 'named_five'),
                join(basePath, 'named_one/../named_four'),
                join(basePath, 'named_one'),
                join(basePath, 'named_two'),
                join(basePath, 'named_three')
            ], loader.getPaths('named'));

            same(await loader.getCacheKey('@named/named_absolute.html', null), cacheKey);
            same((await loader.getSourceContext('index.html', null))?.code, "normal (four)");
            same((await loader.getSourceContext('@__main__/index.html', null))?.code, "normal (four)");
            same((await loader.getSourceContext('@named/index.html', null))?.code, "named path (five)");
        }

        const loader = createFilesystemLoader(createFilesystem());
        const filePath = 'foo/bar';

        loader.addPath(filePath);
        loader.prependPath(filePath);
        loader.prependPath(join(fixturesPath, 'named_one'), 'foo');

        same(loader.getPaths('foo'), [join(fixturesPath, 'named_one')]);

        end();
    });

    test('no paths passed to factory', ({same, end}) => {
        const loader = createFilesystemLoader(createFilesystem());

        same(loader.getPaths(), []);
        same(loader.getPaths('foo'), []);

        end();
    });

    test('getNamespaces', ({same, end}) => {
        const loader = createFilesystemLoader(createFilesystem(), '/tmp');

        same(loader.getNamespaces(), [MAIN_NAMESPACE]);

        loader.addPath('/tmp', 'named');

        same(loader.getNamespaces(), [MAIN_NAMESPACE, 'named']);

        end();
    });

    test('getSourceContext', async ({test}) => {
        test('returns a source on found template', async ({same, end}) => {
            const basePath = fixturesPath;
            const loader = createFilesystemLoader(createFilesystem(), fixturesPath);

            loader.addPath(join(basePath, 'named_one'), 'named');

            same((await loader.getSourceContext('@named/index.html', null))?.code, 'named path');
            same((await loader.getSourceContext('@named/index.html', null))?.name, '@named/index.html');
            same((await loader.getSourceContext('named_two/index.html', null))?.code, 'named path (two)');
            same((await loader.getSourceContext('named_two/index.html', null))?.name, 'named_two/index.html');
            end();
        });

        test('returns null on missing template', async ({same, end}) => {
            const basePath = fixturesPath;
            const loader = createFilesystemLoader(createFilesystem(), [join(basePath, 'normal_one')]);

            loader.addPath(join(basePath, 'named_one'), 'named');

            same(await loader.getSourceContext('@named/nowhere.html', null), null);

            end();
        });

        test('does not hit the cache ???', async ({same, end}) => { // todo: why ???
            const filesystem = createFilesystem();

            const loader = createFilesystemLoader(filesystem, [join(fixturesPath, 'normal_one')]);

            const isFileSpy = spy(stats, "isFile");

            loader.addPath(join(fixturesPath, 'normal_one'), 'normal');

            await loader.getSourceContext('@normal/index.html', null);
            await loader.getSourceContext('index.html', null);

            same(isFileSpy.callCount, 2); // todo: should it hit the cache?

            isFileSpy.restore();

            end();
        });

        test('normalizes template name', async ({same, end}) => {
            const loader = createFilesystemLoader(createFilesystem(), fixturesPath);

            const names = [
                ['named_one/index.html', 'named_one/index.html'],
                ['named_one//index.html', 'named_one/index.html'],
                ['named_one///index.html', 'named_one/index.html'],
                ['../fixtures/named_one/index.html', '../fixtures/named_one/index.html'],
                ['..//fixtures//named_one//index.html', '../fixtures/named_one/index.html'],
                ['..///fixtures///named_one///index.html', '../fixtures/named_one/index.html'],
                ['named_one\\index.html', 'named_one/index.html'],
                ['named_one\\\\index.html', 'named_one/index.html'],
                ['named_one\\\\\\index.html', 'named_one/index.html'],
                ['..\\fixtures\\named_one\\index.html', '../fixtures/named_one/index.html'],
                ['..\\\\fixtures\\\\named_one\\\\index.html', '../fixtures/named_one/index.html'],
                ['..\\\\\\fixtures\\named_one\\\\\\index.html', '../fixtures/named_one/index.html']
            ];

            for (const [name, expected] of names) {
                same(await loader.getSourceContext(name, null), createSource(name, 'named path', resolve(fixturesPath, expected)));
            }

            end();
        });

        test('propagates filesystem readFile errors', async ({same, fail, end}) => {
            const filesystem = createFilesystem();

            const loader = createFilesystemLoader(filesystem, fixturesPath);

            const readFileStub = stub(filesystem, "readFile").callsFake((_path, callback) => {
                callback('I am Error');
            });

            try {
                await loader.getSourceContext('named_one/index.html', null);

                fail();
            } catch (error) {
                same(error, 'I am Error');
            }

            readFileStub.restore();

            end();
        });

        test('returns null on filesystem stat error', async ({same, end}) => {
            const filesystem = createFilesystem();

            const loader = createFilesystemLoader(filesystem, fixturesPath);

            const statStub = stub(filesystem, "stat").callsFake((_path, callback) => {
                callback('I am Error');
            });

            same(await loader.getSourceContext('named_one/index.html', null), null);

            statStub.restore();

            end();
        });

        test('returns a source on found template with absolute root path', async ({same, end}) => {
            const loader = createFilesystemLoader(createFilesystem(), '/fixtures');

            same((await loader.getSourceContext('named_one/index.html', null))?.code, 'named path');

            end();
        });
    });

    test('addPath / prependPath', ({test}) => {
        test('trim trailing slashes', ({same, end}) => {
            let loader = createFilesystemLoader(createFilesystem(), fixturesPath);

            loader.addPath(join(fixturesPath, 'normal_one/'));
            loader.addPath(join(fixturesPath, 'normal_one//'));
            loader.addPath(join(fixturesPath, 'normal_one\\'));
            loader.addPath(join(fixturesPath, 'normal_one\\\\'));

            same(loader.getPaths(), [
                fixturesPath,
                join(fixturesPath, 'normal_one'),
                join(fixturesPath, 'normal_one'),
                join(fixturesPath, 'normal_one'),
                join(fixturesPath, 'normal_one')
            ]);

            loader = createFilesystemLoader(createFilesystem(), fixturesPath);

            loader.prependPath(join(fixturesPath, 'normal_one/'));
            loader.prependPath(join(fixturesPath, 'normal_one//'));
            loader.prependPath(join(fixturesPath, 'normal_one\\'));
            loader.prependPath(join(fixturesPath, 'normal_one\\\\'));

            same(loader.getPaths(), [
                join(fixturesPath, 'normal_one'),
                join(fixturesPath, 'normal_one'),
                join(fixturesPath, 'normal_one'),
                join(fixturesPath, 'normal_one'),
                fixturesPath
            ]);

            end();
        });

        test('reset the caches', async ({same, end}) => {
            const filesystem = createFilesystem();

            const loader = createFilesystemLoader(filesystem, fixturesPath);

            const statSpy = spy(filesystem, "stat");

            await loader.getCacheKey('named_one/index.html', null);

            loader.addPath('foo');

            await loader.getCacheKey('named_one/index.html', null);

            same(statSpy.callCount, 2);

            statSpy.restore();

            end();
        });
    });

    test('exists', async ({test}) => {
        test('on cache miss', async ({same, end}) => {
            let loader = createFilesystemLoader(createFilesystem(), fixturesPath);

            same(await loader.exists('foo', null), false);
            same(await loader.exists('@foo/bar', null), false);
            same(await loader.exists('@foo/bar', null), false);

            loader = createFilesystemLoader(createFilesystem(), []);

            same(await loader.exists("foo\0.twig", null), false);
            same(await loader.exists('@foo', null), false);
            same(await loader.exists('foo', null), false);
            same(await loader.exists('@foo/bar.twig', null), false);

            loader.addPath(join(fixturesPath, 'normal_one'));
            same(await loader.exists('index.html', null), true);
            loader.addPath(join(fixturesPath, 'normal_one'), 'foo');
            same(await loader.exists('@foo/index.html', null), true);

            end();
        });

        test('on cache hit', async ({same, end}) => {
            const filesystem = createFilesystem();
            const loader = createFilesystemLoader(filesystem, join(fixturesPath, 'normal_one'));

            await loader.getSourceContext('index.html', null);

            const statSpy = spy(filesystem, 'stat');

            same(await loader.exists('index.html', null), true);
            same(statSpy.notCalled, true, 'findTemplate is not called');

            statSpy.restore();

            end();
        });
    });

    test('resolve', async ({same, end}) => {
        const loader = createFilesystemLoader(createFilesystem(), fixturesPath);

        same(await loader.resolve('named_one/index.html', null), resolve(join(fixturesPath, 'named_one/index.html')));

        end();
    });

    test('isFresh', async ({same, end}) => {
        const loader = createFilesystemLoader(createFilesystem(), fixturesPath);

        same(await loader.isFresh('named_one/index.html', 0, null), false);
        same(await loader.isFresh('named_one/index.html', 1, null), true);
        same(await loader.isFresh('named_one/index.html', 2, null), true);
        same(await loader.isFresh('missing', 0, null), true);
        same(await loader.isFresh('missing', 1, null), true);
        same(await loader.isFresh('missing', 2, null), true);

        end();
    });

    test('supports relative embed', async ({same, end}) => {
        const createMockedEnvironment = (
            loader: TwingLoader,
            options: TwingEnvironmentOptions | null = null
        ): TwingEnvironment => {
            const environment = createEnvironment(loader, options || {});

            return environment;
        };

        const loader = createFilesystemLoader(createFilesystem(), fixturesPath);
        const environment = createMockedEnvironment(loader);

        const output = await environment.render('embed/index.html.twig', {});

        same(output, 'Hello world!Hello world!');

        end();
    });

    test('getCacheKey', ({test}) => {
        test('returns the template path on found template', async ({same, end}) => {
            const loader = createFilesystemLoader(createFilesystem(), fixturesPath);

            same(await loader.getCacheKey('named_one/index.html', null), 'fixtures/named_one/index.html');

            end()
        });

        test('returns null on missing template', async ({same, end}) => {
            const loader = createFilesystemLoader(createFilesystem(), fixturesPath);

            same(await loader.getCacheKey('missing', null), null);

            end()
        });
    });
});

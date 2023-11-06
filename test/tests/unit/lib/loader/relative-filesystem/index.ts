import * as tape from 'tape';
import {relative, resolve} from "path";
import {createSource} from "../../../../../../src/lib/source";
import {
    createRelativeFilesystemLoader,
    TwingRelativeFilesystemLoaderFilesystem
} from "../../../../../../src/lib/loader/relative-filesystem";
import {spy, stub} from "sinon";

const fixturesPath = resolve('fixtures');

const directories: Array<string> = [
    fixturesPath,
    'fixtures',
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
    ['fixtures/partial.html.twig', `PARTIAL`],
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

const filesystem: TwingRelativeFilesystemLoaderFilesystem = {
    readFile: (path, callback) => {
        const template = templates.find(([templatePath]) => {
            const resolvedTemplatePath = resolve(templatePath);

            return resolvedTemplatePath === path;
        });

        callback(null, Buffer.from(template ? template[1] : ''));
    },
    stat: (path, callback) => {
        const filesystemPath = relative(resolve('.'), path);
        
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

tape('createRelativeFilesystemLoader', ({test}) => {
    test('getSourceContext', async ({test}) => {
        test('returns a source on found template', async ({test}) => {
            test('with from set to null', async ({same, end}) => {
                const loader = createRelativeFilesystemLoader(filesystem);

                const source = await loader.getSourceContext('fixtures/normal_one/index.html', null)

                same(source?.name, 'fixtures/normal_one/index.html');
                same(source?.resolvedName, resolve('fixtures/normal_one/index.html'));

                end();
            });

            test('with from defined', async ({same, end}) => {
                const loader = createRelativeFilesystemLoader(filesystem);

                const source = await loader.getSourceContext('normal_one/index.html', createSource('', 'index.html.twig', 'fixtures/index.html.twig'))

                same(source?.name, 'normal_one/index.html');
                same(source?.resolvedName, resolve('fixtures/normal_one/index.html'));

                end();
            });
        });

        test('propagates filesystem readFile errors', async ({same, fail, end}) => {
            const loader = createRelativeFilesystemLoader(filesystem);

            const readFileStub = stub(filesystem, "readFile").callsFake((_path, callback) => {
                callback('I am Error');
            });

            try {
                await loader.getSourceContext('named_one/index.html', createSource('', 'fixtures/index.html'));

                fail();
            } catch (error) {
                same(error, 'I am Error');
            }

            readFileStub.restore();

            end();
        });

        test('returns null on filesystem stat error', async ({same, end}) => {
            const loader = createRelativeFilesystemLoader(filesystem);

            const statStub = stub(filesystem, "stat").callsFake((_path, callback) => {
                callback('I am Error', null);
            });

            same(await loader.getSourceContext('named_one/index.html', null), null);

            statStub.restore();

            end();
        });
        
        test('normalizes template name', async ({test}) => {
            let loader = createRelativeFilesystemLoader(filesystem);

            let names = [
                ['named_one/index.html', 'fixtures/named_one/index.html'],
                ['named_one//index.html', 'fixtures/named_one/index.html'],
                ['named_one///index.html', 'fixtures/named_one/index.html'],
                ['../fixtures/named_one/index.html', 'fixtures/named_one/index.html'],
                ['..//fixtures//named_one//index.html', 'fixtures/named_one/index.html'],
                ['..///fixtures///named_one///index.html', 'fixtures/named_one/index.html'],
                ['named_one\\index.html', 'fixtures/named_one/index.html'],
                ['named_one\\\\index.html', 'fixtures/named_one/index.html'],
                ['named_one\\\\\\index.html', 'fixtures/named_one/index.html'],
                ['..\\fixtures\\named_one\\index.html', 'fixtures/named_one/index.html'],
                ['..\\\\fixtures\\\\named_one\\\\index.html', 'fixtures/named_one/index.html'],
                ['..\\\\\\fixtures\\named_one\\\\\\index.html', 'fixtures/named_one/index.html']
            ];

            for (const [name, expected] of names) {
                test(name, async ({same, end}) => {
                    const source = await loader.getSourceContext(name, createSource('', 'fixtures/foo.html'));

                    const foo = source && relative('.', source.resolvedName);

                    same(foo, expected);

                    end();
                });
            }
        });

        test('uses the cache', async ({same, end}) => {
            let loader = createRelativeFilesystemLoader(filesystem);
            
            const statSpy = spy(filesystem, "stat");
            
            await loader.getSourceContext('named_one/index.html', createSource('', 'fixtures/index.html'));
            await loader.getSourceContext('named_one/index.html', createSource('', 'fixtures/index.html'));

            same(statSpy.callCount, 1);
            
            statSpy.restore();
            
            end();
        });
    });

    test('resolve', ({test}) => {
        test('with from set to null', async ({same, end}) => {
            const loader = createRelativeFilesystemLoader(filesystem);

            same(await loader.resolve('fixtures/normal_one/index.html', null), resolve('fixtures/normal_one/index.html'));

            end();
        });

        test('with from defined', async ({same, end}) => {
            const loader = createRelativeFilesystemLoader(filesystem);

            same(await loader.resolve('partial.html.twig', createSource('', 'index.html.twig', 'fixtures/index.html.twig')), resolve('fixtures/partial.html.twig'));

            end();
        });
    });

    test('exists', async ({same, end}) => {
        const resolvePath = (path: string) => {
            return resolve('fixtures', path);
        };

        const loader = createRelativeFilesystemLoader(filesystem);
        const source = createSource('', resolvePath('index.html'));

        same(await loader.exists('normal_one/index.html', source), true);
        same(await loader.exists('foo', source), false);

        await loader.getSourceContext('normal_one/index.html', source);

        const statSpy = spy(filesystem, 'stat');
        const exists = await loader.exists('normal_one/index.html', source);

        same(exists, true);
        same(statSpy.callCount, 0);

        same(await loader.exists('normal_one/index.html', null), false);
        same(await loader.exists("foo\0.twig", source), false);
        same(await loader.exists('@foo', source), false);
        same(await loader.exists('foo', source), false);
        same(await loader.exists('@foo/bar.twig', source), false);

        end();
    });

    test('isFresh', async ({test}) => {
        test('with template changed after the passed time', async ({same, end}) => {
            const loader = createRelativeFilesystemLoader(filesystem);
            
            same(await loader.isFresh('fixtures/normal_one/index.html', 0, null), false);

            end();
        });

        test('with template changed exactly at the passed time', async ({same, end}) => {
            const loader = createRelativeFilesystemLoader(filesystem);

            same(await loader.isFresh('fixtures/normal_one/index.html', 1, null), true);

            end();
        });

        test('with template changed before the passed time', async ({same, end}) => {
            const loader = createRelativeFilesystemLoader(filesystem);

            same(await loader.isFresh('fixtures/normal_one/index.html', 2, null), true);

            end();
        });

        test('with missing template', async ({same, end}) => {
            const loader = createRelativeFilesystemLoader(filesystem);
            
            same(await loader.isFresh('fixtures/missing.html', new Date().getTime(), null), true);

            end();
        });
    });

    test('getCacheKey', async ({same, end}) => {
        const loader = createRelativeFilesystemLoader(filesystem);
        const resolvePath = (path: string) => {
            return resolve('test/tests/unit/lib/loader/relative-filesystem/fixtures', path);
        };

        const source = createSource('', resolvePath('index.html'));

        const key1 = loader.getCacheKey('partial.html.twig', source);
        const key2 = loader.getCacheKey('../fixtures/partial.html.twig', source);

        same(key1, key2);

        end();
    });
});

import * as tape from 'tape';
import {createArrayLoader} from "../../../../../../src/lib/loader/array";

tape('createArrayLoader', ({test}) => {
    test('resolve', async ({same, end}) => {
        let loader = createArrayLoader({
            foo: 'bar',
            bar: 'foo'
        });

        same(await loader.resolve('foo', null), 'foo');
        same(await loader.resolve('bar', null), 'bar');

        loader = createArrayLoader({});

        same(await loader.resolve('foo', null), null);
        same(await loader.resolve('bar', null), null);

        end();
    });

    test('getSourceContext', async ({same, end}) => {
        const loader = createArrayLoader({});

        same(await loader.getSourceContext('foo', null), null);

        end();
    });

    test('getCacheKey', async ({test}) => {
        test('on found template', async ({same, end}) => {
            let loader = createArrayLoader({
                foo: 'bar'
            });

            same(await loader.getCacheKey('foo', null), 'foo:bar');

            end();
        });

        test('when two templates has same content', async ({same, end}) => {
            const loader = createArrayLoader({
                foo: 'bar',
                baz: 'bar'
            });

            same(await loader.getCacheKey('foo', null), 'foo:bar');
            same(await loader.getCacheKey('baz', null), 'baz:bar');

            end();
        });

        test('is protected from edge collisions', async (test) => {
            let loader = createArrayLoader({
                foo__: 'bar',
                foo: '__bar'
            });

            test.same(await loader.getCacheKey('foo__', null), 'foo__:bar');
            test.same(await loader.getCacheKey('foo', null), 'foo:__bar');

            test.end();
        });

        test('returns null on missing template', async ({same, end}) => {
            const loader = createArrayLoader({});

            same(await loader.getCacheKey('foo', null), null);

            end();
        });
    });

    test('setTemplate', async ({same, end}) => {
        const loader = createArrayLoader({});

        loader.setTemplate('foo', 'bar');

        same((await loader.getSourceContext('foo', null))?.code, 'bar');

        end();
    });

    test('isFresh', async ({same, end}) => {
        const loader = createArrayLoader({
            foo: 'bar'
        });

        same(await loader.isFresh('foo', 0, null), true);
        same(await loader.isFresh('bar', 0, null), true);

        end();
    });
});

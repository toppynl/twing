import tape from "tape";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../../main/lib/loader/array";

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

        same(await loader.getSource('foo', null), null);

        end();
    });

    test('resolve', async ({test}) => {
        test('on found template', async ({same, end}) => {
            let loader = createArrayLoader({
                foo: 'bar',
                bar: 'bar'
            });

            same(await loader.resolve('foo', null), 'foo');
            same(await loader.resolve('bar', null), 'bar');

            end();
        });

        test('returns null on missing template', async ({same, end}) => {
            const loader = createArrayLoader({});

            same(await loader.resolve('foo', null), null);

            end();
        });
    });

    test('setTemplate', async ({same, end}) => {
        const loader = createArrayLoader({});

        loader.setTemplate('foo', 'bar');

        same((await loader.getSource('foo', null))?.code, 'bar');

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

tape('createSynchronousArrayLoader', ({test}) => {
    test('resolve', ({same, end}) => {
        let loader = createSynchronousArrayLoader({
            foo: 'bar',
            bar: 'foo'
        });

        same(loader.resolve('foo', null), 'foo');
        same(loader.resolve('bar', null), 'bar');

        loader = createSynchronousArrayLoader({});

        same(loader.resolve('foo', null), null);
        same(loader.resolve('bar', null), null);

        end();
    });

    test('getSourceContext', ({same, end}) => {
        const loader = createSynchronousArrayLoader({});

        same(loader.getSource('foo', null), null);

        end();
    });

    test('resolve', async ({test}) => {
        test('on found template', ({same, end}) => {
            let loader = createSynchronousArrayLoader({
                foo: 'bar',
                bar: 'bar'
            });

            same(loader.resolve('foo', null), 'foo');
            same(loader.resolve('bar', null), 'bar');

            end();
        });

        test('returns null on missing template', ({same, end}) => {
            const loader = createSynchronousArrayLoader({});

            same(loader.resolve('foo', null), null);

            end();
        });
    });

    test('setTemplate', ({same, end}) => {
        const loader = createSynchronousArrayLoader({});

        loader.setTemplate('foo', 'bar');

        same((loader.getSource('foo', null))?.code, 'bar');

        end();
    });

    test('isFresh', ({same, end}) => {
        const loader = createSynchronousArrayLoader({
            foo: 'bar'
        });

        same(loader.isFresh('foo', 0, null), true);
        same(loader.isFresh('bar', 0, null), true);

        end();
    });
});

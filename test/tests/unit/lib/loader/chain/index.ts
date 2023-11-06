import * as tape from 'tape';
import {createChainLoader} from "../../../../../../src/lib/loader/chain";
import {createArrayLoader} from "../../../../../../src/lib/loader/array";
import {spy, stub} from "sinon";

tape('createChainLoader', ({test}) => {
    test('getSourceContext', ({test}) => {
        let loader = createChainLoader([
            createArrayLoader({'foo': 'bar'}),
            createArrayLoader({'errors/index.html': 'baz'})
        ]);

        test('return the source context of the first loader that returns a source context', ({test}) => {
            test('foo', ({same, end}) => {
                loader.getSourceContext('foo', null)
                    .then((source) => {
                        same(source?.name, 'foo');
                        same(source?.code, 'bar');

                        end();
                    });
            });

            test('errors/index.html', ({same, end}) => {
                loader.getSourceContext('errors/index.html', null)
                    .then((source) => {
                        same(source?.name, 'errors/index.html');
                        same(source?.code, 'baz');

                        end();
                    });
            });
        });

        test('returns null when the template does not exist', async ({same, end}) => {
            const loader = createChainLoader([]);

            same(await loader.getSourceContext('foo', null), null);

            end();
        });
    });

    test('getCacheKey', async ({test}) => {
        test('returns the cache key when the template exists', async ({same, end}) => {
            let loader = createChainLoader([
                createArrayLoader({'foo': 'bar'}),
                createArrayLoader({'foo': 'foobar', 'bar': 'foo'}),
            ]);

            same(await loader.getCacheKey('foo', null), 'foo:bar');
            same(await loader.getCacheKey('bar', null), 'bar:foo');

            let cacheKeyStub = stub(loader, 'getCacheKey').resolves(null);

            loader = createChainLoader([
                loader
            ]);

            same(await loader.getCacheKey('foo', null), null);

            cacheKeyStub.restore();

            let loader2 = createArrayLoader({'foo': 'bar'});

            cacheKeyStub = stub(loader2, 'getCacheKey').resolves(null);

            loader = createChainLoader([
                loader2
            ]);

            same(await loader.getCacheKey('foo', null), null);

            cacheKeyStub.restore();

            end();
        });

        test('returns null when the template does not exist', async ({same, end}) => {
            const loader = createChainLoader([]);

            same(await loader.getCacheKey('foo', null), null);

            end();
        });
    });

    test('addLoader', ({same, end}) => {
        const loader = createChainLoader([]);

        loader.addLoader(createArrayLoader({'foo': 'bar'}));
        loader.getSourceContext('foo', null)
            .then((source) => {
                same(source?.code, 'bar');

                end();
            });
    });

    test('getLoaders', (test) => {
        let loaders = [
            createArrayLoader({'foo': 'bar'})
        ];

        let loader = createChainLoader(loaders);

        test.same(loader.loaders, loaders);

        test.end();
    });

    test('exists', ({test}) => {
        let loader1 = createArrayLoader({});
        let loader1ExistsStub = stub(loader1, 'exists').returns(Promise.resolve(false));
        let loader1GetSourceContextSpy = spy(loader1, 'getSourceContext');

        let loader2 = createArrayLoader({});
        let loader2ExistsStub = stub(loader2, 'exists').returns(Promise.resolve(true));
        let loader2GetSourceContextSpy = spy(loader2, 'getSourceContext');

        let loader3 = createArrayLoader({});
        let loader3ExistsStub = stub(loader3, 'exists').returns(Promise.resolve(true));
        let loader3GetSourceContextSpy = spy(loader3, 'getSourceContext');

        test('resolves to true as soon as a loader resolves to true', async ({same, end}) => {
            let loader = createChainLoader([
                loader1,
                loader2,
                loader3
            ]);

            same(await loader.exists('foo', null), true);
            same(loader1ExistsStub.callCount, 1, 'loader 1 exists is called once');
            same(loader2ExistsStub.callCount, 1, 'loader 2 exists is called once');
            same(loader3ExistsStub.callCount, 0, 'loader 3 exists is not called');
            same(loader1GetSourceContextSpy.callCount, 0, 'loader 1 getSourceContext is not called');
            same(loader2GetSourceContextSpy.callCount, 0, 'loader 2 getSourceContext is not called');
            same(loader3GetSourceContextSpy.callCount, 0, 'loader 3 getSourceContext is not called');

            loader1ExistsStub.restore();
            loader2ExistsStub.restore();
            loader3ExistsStub.restore();

            end();
        });

        test('resolves to false is all loaders resolve to false', async ({same, end}) => {
            let loader = createChainLoader([
                loader1,
                loader2
            ]);

            loader1ExistsStub = stub(loader1, 'exists').returns(Promise.resolve(false));
            loader2ExistsStub = stub(loader2, 'exists').returns(Promise.resolve(false));

            same(await loader.exists('foo', null), false);

            loader1ExistsStub.restore();
            loader2ExistsStub.restore();

            end();
        });

        test('hits cache on subsequent calls', async ({same, end}) => {
            let loader = createChainLoader([
                createArrayLoader({
                    foo: 'foo'
                })
            ]);

            const existsSpy = spy(loader.loaders[0], 'exists');

            await loader.exists('foo', null);
            await loader.exists('foo', null);

            same(existsSpy.callCount, 1);

            existsSpy.restore();

            end();
        });
    });

    test('isFresh', async ({same, end}) => {
        let loader = createChainLoader([
            createArrayLoader({'foo': 'bar'}),
            createArrayLoader({'foo': 'foobar', 'bar': 'foo'}),
        ]);

        same(await loader.isFresh('foo', 0, null), true);
        same(await loader.isFresh('bar', 0, null), true);

        let isFreshStub = stub(loader, 'isFresh').resolves(null);

        loader = createChainLoader([
            loader
        ]);

        same(await loader.isFresh('foo', 0, null), null);

        isFreshStub.restore();

        const loader2 = createArrayLoader({'foo': 'bar'});

        isFreshStub = stub(loader2, 'isFresh').resolves(null);

        loader = createChainLoader([
            loader2
        ]);

        same(await loader.isFresh('foo', 0, null), null);

        isFreshStub.restore();

        end();
    });

    test('resolve', async ({test}) => {
        test('returns whatever the first loader that handles the passed name returns', async ({same, end}) => {
            const loader = createChainLoader([
                createArrayLoader({'foo': 'bar'}),
                createArrayLoader({'bar': 'foo'}),
            ]);

            same(await loader.resolve('bar', null), 'bar');

            end();
        });

        test('when some loaders return null', async ({same, end}) => {
            const loader1 = createArrayLoader({});

            stub(loader1, 'exists').resolves(true);
            stub(loader1, 'resolve').resolves(null);

            const loader2 = createArrayLoader({'bar': 'foo'});

            const loader = createChainLoader([
                loader1,
                loader2
            ]);

            same(await loader.resolve('bar', null), 'bar');

            end();
        });

        test('when all loaders return null', async ({same, end}) => {
            const loader1 = createArrayLoader({});

            stub(loader1, 'exists').resolves(true);
            stub(loader1, 'resolve').resolves(null);

            const loader2 = createArrayLoader({});

            stub(loader2, 'exists').resolves(true);
            stub(loader2, 'resolve').resolves(null);

            const loader = createChainLoader([
                loader1,
                loader2
            ]);

            same(await loader.resolve('foo', null), null);

            end();
        });
    });
});

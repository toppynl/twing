import * as tape from 'tape';
import {spy, stub} from "sinon";
import {createFilesystemCache, TwingFilesystemCacheFilesystem} from "../../../../../../src/lib/cache/filesystem";
import {resolve} from "path";

const filesystem: TwingFilesystemCacheFilesystem = {
    mkdir: (_path, _options, callback) => {
        callback(null);
    },
    stat: (_path, callback) => {
        callback(null,{
            mtimeMs: 0
        });
    },
    writeFile: (_path, _data, callback) => {
        callback(null);
    },
    readFile: (path, callback) => {
        if (path === resolve('foo/whatever')) {
            callback(null, Buffer.from(`whatever content`));
        }
        else {
            callback(new Error('I am Error'), null);
        }
    }
};

tape('createFilesystemCache', ({test}) => {
    const candidate = createFilesystemCache('foo', filesystem);

    test('load', async ({test}) => {
        test('should read the file as expected', async ({same, end}) => {
            const readFileSpy = spy(filesystem, "readFile");

            await candidate.load('whatever');

            same(readFileSpy.callCount, 1);
            same(readFileSpy.firstCall.args[0], resolve('foo/whatever'));

            readFileSpy.restore();

            end();
        });
        
        test('should return null on stat failure', async ({same, end}) => {
            const statStub = stub(filesystem, "stat").callsFake((_path, callback) => {
                callback(new Error('I am Error'));
            });
            
            const content = await candidate.load('whatever');
            
            statStub.restore();
            
            same(content, null);

            end();
        });
        
        test('should return null on read failure', async ({same, end}) => {
            const readStub = stub(filesystem, "readFile").callsFake((_path, callback) => {
                callback(new Error('I am Error'));
            });

            const content = await candidate.load('whatever');

            readStub.restore();

            same(content, null);

            end();
        });
    });

    test('write', async ({test}) => {
        test('returns as expected', async ({same, fail, end}) => {
            const result = await candidate.write('foo', 'bar');

            same(result, undefined);

            const writeFileStub = stub(filesystem, 'writeFile').callsFake((_path, _data, callback) => {
                callback(new Error('I am Error'));
            });

            try {
                await candidate.write('foo', 'bar');

                fail();
            } catch (error: any) {
                same((error as Error).message, 'Failed to write cache file "foo".');
            }

            writeFileStub.restore();

            end();
        });

        test('throws on mkdir failure', async ({same, fail, end}) => {
            const statStub = stub(filesystem, 'stat').callsFake((_path, callback) => {
                callback(new Error('I am Error'));
            });
            
            const mkdirStub = stub(filesystem, 'mkdir').callsFake((_path, _options, callback) => {
                callback(new Error('I am Error'));
            });

            try {
                await candidate.write('foo', 'bar');

                fail();
            } catch (error: any) {
                same((error as Error).message, 'Failed to write cache file "foo".');
            }

            mkdirStub.restore();
            statStub.restore();

            end();
        });

        test('creates the expected directory hierarchy', async ({same, end}) => {
            const result = await candidate.write('foo', 'bar');

            same(result, undefined);

            const writeFileSpy = spy(filesystem, 'writeFile');
            const mkdirSpy = spy(filesystem, 'mkdir');

            const statStub = stub(filesystem, 'stat').callsFake((_path, callback) => {
                if (_path === 'foo/bar') {
                    callback(new Error('I am Error'));
                }
                else {
                    callback({
                        mtimeMs: 0
                    });
                }
            });
            
            await candidate.write('foo/bar', 'content');
            
            same(mkdirSpy.callCount, 1);
            same(mkdirSpy.firstCall.args[0], 'foo/foo');
            same(writeFileSpy.callCount, 1);
            same(writeFileSpy.firstCall.args[0], 'foo/foo/bar');

            statStub.restore();
            writeFileSpy.restore();
            mkdirSpy.restore();

            end();
        });
    });

    test('getTimestamp', async ({same, end}) => {
        let statStub = stub(filesystem, 'stat').callsFake((_path, callback) => {
            callback(null, {
                mtimeMs: 1
            });
        });

        same(await candidate.getTimestamp('foo'), 1);

        statStub.restore();

        statStub = stub(filesystem, 'stat').callsFake((_path, callback) => {
            callback(new Error('I am Error'));
        });

        same(await candidate.getTimestamp('foo'), 0);

        statStub.restore();

        end();
    });

    test('generateKey', async ({same, end}) => {
        same(await candidate.generateKey('bar'), 'bar.js');

        end();
    });
});

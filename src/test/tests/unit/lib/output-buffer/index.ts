import tape from "tape";
import {createOutputBuffer} from "../../../../../main/lib/output-buffer";
import {spy} from "sinon";
import {Writable} from "stream";

const outputBuffer = createOutputBuffer();

let reset = (restart = true) => {
    while (outputBuffer.getLevel()) {
        outputBuffer.endAndClean();
    }

    if (restart) {
        outputBuffer.start();
        outputBuffer.echo('foo');
        outputBuffer.start();
        outputBuffer.echo('bar');
        outputBuffer.start();
        outputBuffer.echo('o');
        outputBuffer.echo('of');
    }
};

tape('TwingOutputBuffering', ({test}) => {
    test('echo', (test) => {
        const writeStream = new Writable({
            write: (_chunk, _encoding, next) => {
                next();
            }
        });
        const outputBuffer = createOutputBuffer();

        outputBuffer.outputStream.pipe(writeStream);

        const writeSpy = spy(writeStream, "write");

        outputBuffer.echo('foo');
        outputBuffer.echo('bar');

        test.same(writeSpy.callCount, 2);
        test.same(writeSpy.firstCall.args[0].toString(), 'foo');
        test.same(writeSpy.secondCall.args[0].toString(), 'bar');
        test.end();
    });

    test('start', (test) => {
        outputBuffer.start();

        test.equal(outputBuffer.getLevel(), 1, 'getLevel() should return 1');

        outputBuffer.start();

        test.equal(outputBuffer.getLevel(), 2, 'getLevel() should return 2');
        test.end();
    });

    test('endAndFlush', ({same, fail, end}) => {
        reset();

        outputBuffer.endAndFlush();

        same(outputBuffer.getLevel(), 2, 'getLevel() should return 2');
        same(outputBuffer.getContents(), 'baroof', `obGetContents() should return 'baroof'`);

        reset(false);

        try {
            outputBuffer.endAndFlush();

            fail();
        } catch (error) {
            same((error as Error).message, 'Failed to delete and flush buffer: no buffer to delete or flush.');
        } finally {
            end();
        }
    });

    test('flush', ({same, fail, end}) => {
        reset();
        outputBuffer.flush();

        same(outputBuffer.getContents(), '', `obGetContents() should return ''`);

        reset(false);

        try {
            outputBuffer.flush();

            fail();
        } catch (error) {
            same((error as Error).message, 'Failed to flush buffer: no buffer to flush.');
        } finally {
            end();
        }
    });

    test('getAndFlush', (test) => {
        reset();

        test.same(outputBuffer.getAndFlush(), 'oof', `obGetFlush() should return 'oof'`);
        test.same(outputBuffer.getContents(), 'baroof', `obGetContents() should return 'baroof'`);

        test.end();
    });

    test('clean', ({same, fail, end}) => {
        reset();
        outputBuffer.clean();

        same(outputBuffer.getLevel(), 3, 'getLevel() should return 3');
        same(outputBuffer.getContents(), '', `obGetContents() should return ''`);

        reset(false);

        try {
            outputBuffer.clean();

            fail();
        } catch (error) {
            same((error as Error).message, 'Failed to clean buffer: no buffer to clean.');
        } finally {
            end();
        }
    });

    test('getAndClean', (test) => {
        reset();

        test.same(outputBuffer.getAndClean(), 'oof', `obGetClean() should return 'oof'`);

        test.end();
    });

    test('endAndClean', ({test}) => {
        test('removes the active buffer and returns true', ({same, end}) => {
            reset();

            same(outputBuffer.endAndClean(), true);
            same(outputBuffer.getLevel(), 2);
            same(outputBuffer.getContents(), 'bar');

            end();
        });

        test('throws an error when there is no active buffer', ({same, fail, end}) => {
            reset(false);

            try {
                outputBuffer.endAndClean();

                fail();
            } catch (error) {
                same((error as Error).message, 'Failed to clean buffer: no buffer to clean.');
            } finally {
                end();
            }
        });
    });

    test('flush', (test) => {
        reset();
        outputBuffer.flush();

        test.same(outputBuffer.getContents(), '', `obGetContents() should return ''`);

        test.end();
    });

    test('support echoing a number when not started', (test) => {
        const outputBuffer = createOutputBuffer();

        let data: string = '';
        
        const writeStream = new Writable({
            write: (chunk, _encoding, next) => {
                data += chunk.toString();
                
                next();
            }
        });
        
        outputBuffer.outputStream.pipe(writeStream);
        
        outputBuffer.echo(1);
        
        test.same(data, '1');

        test.end();
    });

    test('support echoing a number when not started without an output stream', ({pass, end}) => {
        const outputBuffer = createOutputBuffer();

        outputBuffer.echo(1);

        pass();

        end();
    });

    test('getLevel', (test) => {
        reset(false);

        test.equals(outputBuffer.getLevel(), 0);

        test.end();
    });

    test('getContents', (test) => {
        reset(true);

        test.equals(outputBuffer.getContents(), 'oof');

        test.end();
    });

    test('getContents when not started', (test) => {
        const outputBuffer = createOutputBuffer();

        test.equals(outputBuffer.getContents(), '');

        test.end();
    });
});

import * as tape from "tape";
import {createTemplate} from "../../../../../src/lib/template";
import {createRuntime} from "../../../../../src/lib/runtime";
import {createSource} from "../../../../../src/lib/source";
import {createExtensionSet} from "../../../../../src/lib/extension-set";
import {Writable} from "stream";
import type {TwingOutputBuffer} from "../../../../../src/lib/output-buffer";
import {TwingLoader} from "../../../../../src/lib/loader";

const createMockedLoader = (): TwingLoader => {
    return {
        getSourceContext() {
            return Promise.resolve(createSource('', ''));
        },
        getCacheKey() {
            return Promise.resolve('');
        },
        isFresh() {
            return Promise.resolve(true);
        },
        exists() {
            return Promise.resolve(true);
        },
        resolve() {
            return Promise.resolve(null);
        }
    };
};

const createCandidate = (definition?: {
    content?: string;
    display?: (context: Record<string, any>, outputBuffer: TwingOutputBuffer) => Promise<void>;
}) => {
    return createTemplate(
        createRuntime(
            createMockedLoader(),
            {},
            createExtensionSet(),
            {}
        ),
        createSource('code', 'name'),
        new Map(),
        new Map(),
        definition?.display || ((_context, outputBuffer) => {
            outputBuffer.echo(definition?.content || 'foo');

            return Promise.resolve();
        }),
        () => Promise.resolve(null),
        () => Promise.resolve(new Map()),
        false
    );
};

tape('createTemplate', ({test}) => {
    test('display', ({test}) => {
        test('returns a readable stream that streams the rendered template', ({same, end}) => {
            const template = createCandidate({
                display: async (_context, outputBuffer) => {
                    for await (const value of [0, 1, 2, 3, 4]) {
                        outputBuffer.echo(value);
                        outputBuffer.flush();
                    }
                }
            });

            let data: Array<number> = [];

            const writableStream = new Writable({
                write(chunk: number, _encoding, next) {
                    data.push(Number.parseInt(chunk.toString()));

                    next();
                }
            });

            writableStream.on("finish", () => {
                same(data, [0, 1, 2, 3, 4]);

                end();
            });

            template.display({}).pipe(writableStream);
        });

        test('returns a readable stream that emits the "error" event on error', ({same, end}) => {
            const template = createCandidate({
                display: () => {
                    return Promise.reject(new Error('I am Error'));
                }
            });

            const stream = template.display({});

            let error: Error;

            stream.on("error", (thrownError) => {
                error = thrownError;
            });

            stream.on("end", () => {
                same(error?.message, 'An exception has been thrown during the rendering of a template ("I am Error").');

                end();
            });

            stream.pipe(new Writable());
        });
    });

    test('render', ({test}) => {
        test('returns a promise that resolves to the rendered template', ({same, end}) => {
            const template = createCandidate({
                content: 'foo'
            });

            return template.render({})
                .then((content) => {
                    same(content, 'foo');
                })
                .finally(end);
        });

        test('returns a promise that rejects to the thrown error', ({same, fail, end}) => {
            const template = createCandidate({
                display: () => {
                    return Promise.reject(new Error('I am Error'));
                }
            });

            return template.render({})
                .then(fail)
                .catch((error: Error) => {
                    same(error.message, 'An exception has been thrown during the rendering of a template ("I am Error").');
                })
                .finally(end);
        });
    });
});

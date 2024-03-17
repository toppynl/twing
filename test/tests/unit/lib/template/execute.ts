import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";
import {createTemplate} from "../../../../../src/lib/template";
import {createTemplateNode} from "../../../../../src/lib/node/template";
import {createBaseNode} from "../../../../../src/lib/node";
import {createSource} from "../../../../../src/lib/source";
import {spy} from "sinon";
import {createOutputBuffer} from "../../../../../src/lib/output-buffer";
import {createContext} from "../../../../../src/lib/context";
import {createSourceMapRuntime} from "../../../../../src/lib/source-map-runtime";
import {executeNode, type TwingNodeExecutor} from "../../../../../src/lib/node-executor";
import {createTextNode} from "../../../../../src/lib/node/text";
import {createVerbatimNode} from "../../../../../src/lib/node/verbatim";
import {createTemplateLoader, type TwingTemplateLoader} from "../../../../../src/lib/template-loader";

tape('createTemplate => ::execute', ({test}) => {
    test('executes the AST according to the passed options', ({test}) => {
        test('when no options is passed', ({same, end}) => {
            const environment = createEnvironment(createArrayLoader({}));
            const ast = createTemplateNode(
                createBaseNode(null, {}, {
                    content: createBaseNode(null)
                }, 1, 1),
                null,
                createBaseNode(null),
                createBaseNode(null),
                createBaseNode(null),
                [],
                createSource('', ''),
                1, 1
            );

            const executeNodeSpy = spy(executeNode);

            const template = createTemplate(ast);

            return template.execute(
                environment,
                createContext(),
                new Map(),
                createOutputBuffer(),
                {
                    nodeExecutor: executeNodeSpy
                }
            ).then(() => {
                same(executeNodeSpy.firstCall.args[1].sandboxed, false);
                same(executeNodeSpy.firstCall.args[1].sourceMapRuntime, undefined);
            }).finally(end);
        });

        test('when some options are passed', ({same, end}) => {
            const environment = createEnvironment(createArrayLoader({}));
            const ast = createTemplateNode(
                createBaseNode(null, {}, {
                    content: createBaseNode(null)
                }, 1, 1),
                null,
                createBaseNode(null),
                createBaseNode(null),
                createBaseNode(null),
                [],
                createSource('', ''),
                1, 1
            );

            const executeNodeSpy = spy(executeNode);

            const template = createTemplate(ast);

            const sourceMapRuntime = createSourceMapRuntime();

            return template.execute(
                environment,
                createContext(),
                new Map(),
                createOutputBuffer(),
                {
                    nodeExecutor: executeNodeSpy,
                    sandboxed: true,
                    sourceMapRuntime
                }
            ).then(() => {
                same(executeNodeSpy.firstCall.args[1].sandboxed, true);
                same(executeNodeSpy.firstCall.args[1].sourceMapRuntime, sourceMapRuntime);
            }).finally(end);
        });
    });

    test('honors the passed node executor', ({same, end}) => {
        const environment = createEnvironment(createArrayLoader({}));
        const ast = createTemplateNode(
            createBaseNode(null, {}, {
                content: createBaseNode(null, {}, {
                    0: createTextNode("5", 1, 1),
                    1: createVerbatimNode("5", 1, 1, "verbatim")
                }, 1, 1)
            }, 1, 1),
            null,
            createBaseNode(null),
            createBaseNode(null),
            createBaseNode(null),
            [],
            createSource('', ''),
            1, 1
        );

        const nodeExecutor: TwingNodeExecutor = (node, executionContext) => {
            if (node.type === "text") {
                executionContext.outputBuffer.echo('foo');

                return Promise.resolve();
            }
            else {
                return executeNode(node, executionContext);
            }
        };

        const template = createTemplate(ast);
        const outputBuffer = createOutputBuffer();

        outputBuffer.start();

        return template.execute(environment, createContext(), new Map(), outputBuffer, {
            nodeExecutor
        }).then(() => {
            same(outputBuffer.getContents(), 'foo5');
        }).finally(end);
    });

    test('honors the passed template loader', ({same, end}) => {
        const environment = createEnvironment(createArrayLoader({
            bar: 'BAR',
            foo: 'FOO'
        }));
        const ast = environment.parse(environment.tokenize(createSource('index', `{{ include("foo") }}{{ include("bar") }}`)));

        const loadedTemplates: Array<string> = [];
        const baseTemplateLoader = createTemplateLoader(environment);

        const templateLoader: TwingTemplateLoader = (name, from) => {
            loadedTemplates.push(`${from}::${name}`);

            return baseTemplateLoader(name, from);
        }

        const template = createTemplate(ast);
        const outputBuffer = createOutputBuffer();

        outputBuffer.start();

        return template.execute(
            environment,
            createContext(),
            new Map(),
            outputBuffer,
            {
                templateLoader
            }
        ).then(() => {
            same(loadedTemplates, [
                'index::foo',
                'index::bar'
            ]);
        }).finally(end);
    });

    test('with some blocks', async ({same, end}) => {
        const environment = createEnvironment(createArrayLoader({
            index: '{{ block("foo") }}, {{ block("aliased-bar") }}',
            blocks: `{% block foo %}foo block content{% endblock %}{% block bar %}bar block content{% endblock %}`
        }));
        
        const template = await environment.loadTemplate('index');
        const outputBuffer = createOutputBuffer();

        outputBuffer.start();

        const blockTemplate = await environment.loadTemplate('blocks');
        
        return template.execute(
            environment,
            createContext(),
            new Map([
                ['foo', [blockTemplate, 'foo']],
                ['aliased-bar', [blockTemplate, 'bar']]
            ]),
            outputBuffer
        ).then(() => {
            same(outputBuffer.getContents(), 'foo block content, bar block content');
        }).finally(end);
    });
});

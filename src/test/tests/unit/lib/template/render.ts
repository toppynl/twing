import tape from "tape";
import {createEnvironment, createSynchronousEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../main/lib/loader/array";
import {createSynchronousTemplate, createTemplate} from "../../../../../main/lib/template";
import {createTemplateNode} from "../../../../../main/lib/node/template";
import {createBaseNode} from "../../../../../main/lib/node";
import {createSource} from "../../../../../main/lib/source";
import {createOutputBuffer} from "../../../../../main/lib/output-buffer";
import {createContext} from "../../../../../main/lib/context";
import {executeNode, type TwingNodeExecutor} from "../../../../../main/lib/node-executor";
import {createTextNode} from "../../../../../main/lib/node/text";
import {createVerbatimNode} from "../../../../../main/lib/node/verbatim";
import {createNameNode} from "../../../../../main/lib/node/expression/name";
import {createPrintNode} from "../../../../../main/lib/node/print";

tape('createTemplate => ::render', ({test}) => {
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
            } else {
                return executeNode(node, executionContext);
            }
        };

        const template = createTemplate(ast);
        const outputBuffer = createOutputBuffer();

        outputBuffer.start();

        return template.render(environment, createContext(), {
            outputBuffer,
            nodeExecutor
        }).then(() => {
            same(outputBuffer.getContents(), 'foo5');
        }).finally(end);
    });
});

tape('createSynchronousTemplate => ::render', ({test}) => {
    test('supports being passed a record as context', ({same, end}) => {
        const environment = createSynchronousEnvironment(createSynchronousArrayLoader({}));
        const ast = createTemplateNode(
            createBaseNode(null, {}, {
                content: createBaseNode(null, {}, {
                    0: createPrintNode(createNameNode("foo", 1, 1), 1, 1),
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

        const template = createSynchronousTemplate(ast);
        
        const output = template.render(environment, {
            foo: 'foo'
        });
        
        same(output, 'foo5');
        
        end();
    });
});

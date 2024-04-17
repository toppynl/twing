import * as tape from "tape";
import {createEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader} from "../../../../../main/lib/loader/array";
import {createTemplate} from "../../../../../main/lib/template";
import {createTemplateNode} from "../../../../../main/lib/node/template";
import {createBaseNode} from "../../../../../main/lib/node";
import {createSource} from "../../../../../main/lib/source";
import {createOutputBuffer} from "../../../../../main/lib/output-buffer";
import {createContext} from "../../../../../main/lib/context";
import {executeNode, type TwingNodeExecutor} from "../../../../../main/lib/node-executor";
import {createTextNode} from "../../../../../main/lib/node/text";
import {createVerbatimNode} from "../../../../../main/lib/node/verbatim";

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

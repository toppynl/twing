import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createAssignNameNode} from "../../../../../../src/lib/node/expression/assign-name";
import {createBaseNode} from "../../../../../../src/lib/node";
import {createSetNode} from "../../../../../../src/lib/node/set";
import {createMockCompiler} from "../../../../../mock/compiler";
import {createPrintNode} from "../../../../../../src/lib/node/print";
import {createTextNode} from "../../../../../../src/lib/node/text";

tape('SetNode', ({test}) => {
    test('factory', ({same, end}) => {
        const namesNode = createBaseNode(null, {}, {
            0: createAssignNameNode('foo', 1, 1)
        }, 1, 1);

        const valuesNode = createBaseNode(null, {}, {
            0: createConstantNode('foo', 1, 1)
        }, 1, 1);

        const node = createSetNode(false, namesNode, valuesNode, 1, 1);

        same(node.children.names, namesNode);
        same(node.children.values, valuesNode);
        same(node.attributes.capture, false);
        same(node.type, 'set');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({test}) => {
        let compiler = createMockCompiler();

        test('basic', ({same, end}) => {
            const namesNode = createBaseNode(null, {}, {
                0: createAssignNameNode('foo', 1, 1)
            }, 1, 1);

            const valuesNode = createBaseNode(null, {}, {
                0: createConstantNode('foo', 1, 1)
            }, 1, 1);

            let node = createSetNode(false, namesNode, valuesNode, 1, 1);

            same(compiler.compile(node).source, `context.proxy[\`foo\`] = \`foo\`;
`);

            end();
        });

        test('with capture', ({same, end}) => {
            const namesNode = createBaseNode(null, {}, {
                0: createAssignNameNode('foo', 1, 1)
            }, 1, 1);

            let valuesNode = createBaseNode(null, {}, {
                0: createPrintNode(createConstantNode('foo', 1, 1), 1, 1)
            }, 1, 1);

            let node = createSetNode(true, namesNode, valuesNode, 1, 1);

            same(compiler.compile(node).source, `outputBuffer.start();
outputBuffer.echo(\`foo\`);
context.proxy[\`foo\`] = (() => {let tmp = outputBuffer.getAndClean(); return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})();
`);

            end();
        });

        test('with capture and text', ({same, end}) => {
            const namesNode = createBaseNode(null, {}, {
                0: createAssignNameNode('foo', 1, 1)
            }, 1, 1);

            let valuesNode = createTextNode('foo', 1, 1);

            let node = createSetNode(true, namesNode, valuesNode, 1, 1);

            same(compiler.compile(node).source, `context.proxy[\`foo\`] = await (async () => {let tmp = \`foo\`; return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})();
`);

            end();
        });

        test('with multiple names and values', ({same, end}) => {
            const namesNode = createBaseNode(null, {}, {
                0: createAssignNameNode('foo', 1, 1),
                1: createAssignNameNode('bar', 1, 1)
            }, 1, 1);

            const valuesNode = createBaseNode(null, {}, {
                0: createConstantNode('foo', 1, 1),
                1: createConstantNode('bar', 1, 1)
            }, 1, 1);

            let node = createSetNode(false, namesNode, valuesNode, 1, 1);

            same(compiler.compile(node).source, `[context.proxy[\`foo\`], context.proxy[\`bar\`]] = [\`foo\`, \`bar\`];
`);

            end();
        });
    });
});

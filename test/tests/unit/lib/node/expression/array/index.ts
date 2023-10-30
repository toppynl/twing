import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../src/lib/node/expression/constant";
import {createArrayNode} from "../../../../../../../src/lib/node/expression/array";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('ArrayNode', ({test}) => {
    test('factory', ({same, end}) => {
        let bar = createConstantNode('bar', 1, 1);

        let node = createArrayNode({
            0: createConstantNode('foo', 1, 1),
            1: bar
        }, 1, 1);

        same(node.children[1], bar);
        same(node.type, 'array');

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();

        let node = createArrayNode({
            0: createConstantNode(0, 1, 1),
            1: createConstantNode('bar', 1, 1),
            2: createConstantNode(1, 1, 1),
            3: createConstantNode('foo', 1, 1)
        }, 1, 1);

        same(compiler.compile(node).source, 'new Map([[0, \`bar\`], [1, \`foo\`]])');

        end();
    });

    test('addElement', ({same, end}) => {
        let compiler = createMockCompiler();

        let node = createArrayNode({
            0: createConstantNode(0, 1, 1),
            1: createConstantNode('first', 1, 1)
        }, 1, 1);

        node.addElement(createConstantNode('second', 1, 1));
        node.addElement(createConstantNode('third', 1, 1));

        same(compiler.compile(node).source, 'new Map([[0, \`first\`], [1, \`second\`], [2, \`third\`]])');

        end();
    });

    test('clone', ({same, end}) => {
        let compiler = createMockCompiler();

        let node = createArrayNode({
            0: createConstantNode(0, 1, 1),
            1: createConstantNode('first', 1, 1)
        }, 1, 1);

        const clone = node.clone();

        clone.addElement(createConstantNode('second', 1, 1));

        same(compiler.compile(node).source, 'new Map([[0, \`first\`]])');
        same(compiler.compile(clone).source, 'new Map([[0, \`first\`], [1, \`second\`]])');

        end();
    });
});

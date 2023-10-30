import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../src/lib/node/expression/constant";
import {createHashNode} from "../../../../../../../src/lib/node/expression/hash";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('HashNode', ({test}) => {
    test('factory', ({same, end}) => {
        let barNode = createConstantNode('bar', 1, 1);

        let node = createHashNode({
            0: createConstantNode('foo', 1, 1),
            1: barNode
        }, 1, 1);

        same(node.children[1], barNode);
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();

        let node = createHashNode({
            0: createConstantNode('foo', 1, 1),
            1: createConstantNode('bar', 1, 1),
            2: createConstantNode('bar', 1, 1),
            3: createConstantNode('foo', 1, 1)
        }, 1, 1);

        same(compiler.compile(node).source, 'new Map([[\`foo\`, \`bar\`], [\`bar\`, \`foo\`]])');

        end();
    });
});

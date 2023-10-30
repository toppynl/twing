import * as tape from 'tape';
import {createBaseNode} from "../../../../../../../src/lib/node";
import {createAssignNameNode} from "../../../../../../../src/lib/node/expression/assign-name";
import {createArrowFunctionNode} from "../../../../../../../src/lib/node/expression/arrow-function";
import {createConstantNode} from "../../../../../../../src/lib/node/expression/constant";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('ArrowFunctionNode', ({test}) => {
    test('factory', ({same, end}) => {
        let names = createBaseNode(null, {}, {
            0: createAssignNameNode('a', 1, 1)
        }, 1, 1);

        let node = createArrowFunctionNode(
            createConstantNode('foo', 1, 1),
            names,
            1, 1
        );

        same(node.children.names, names);
        same(node.type, "arrow_function");

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();
        let expected = `async ($__a__, $__b__) => {context.proxy['a'] = $__a__; context.proxy['b'] = $__b__; return \`foo\`;}`;

        let node = createArrowFunctionNode(
            createConstantNode('foo', 1, 1),
            createBaseNode(null, {}, {
                0: createAssignNameNode('a', 1, 1),
                1: createAssignNameNode('b', 1, 1)
            }, 1, 1),
            1, 1
        );

        same(compiler.compile(node).source, expected);

        end();
    });
});

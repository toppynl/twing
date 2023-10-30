import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../../src/lib/node/expression/constant";
import {createConstantTestNode} from "../../../../../../../../../src/lib/node/expression/call/test/constant";
import {createMockCompiler} from "../../../../../../../../mock/compiler";
import {createArgumentsNode} from "../../../../../../../../../src/lib/node/expression/arguments";

tape('node/expression/test/constant', ({test}) => {
    test('compile', ({same, end}) => {
        let node = createConstantTestNode(
            createConstantNode('foo', 1, 1),
            createArgumentsNode({
                0: createConstantNode('Foo', 1, 1)
            }, 1, 1),
            1, 1
        );
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, '(`foo` === this.constant(`Foo`))');

        node = createConstantTestNode(
            createConstantNode('foo', 1, 1),
            createArgumentsNode({
                0: createConstantNode('Foo', 1, 1),
                1: createConstantNode('Bar', 1, 1)
            }, 1, 1),
            1, 1
        );

        same(compiler.compile(node).source, '(`foo` === this.constant(`Foo`, `Bar`))');

        end();
    });
});

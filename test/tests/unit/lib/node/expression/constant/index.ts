import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../src/lib/node/expression/constant";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('ConstantNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createConstantNode('foo', 1, 1);

        same(node.attributes.value, 'foo');

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();

        let node = createConstantNode('foo', 1, 1);

        same(compiler.compile(node).source, '\`foo\`');
        end();
    });
});

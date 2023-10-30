import * as tape from 'tape';
import {createAssignNameNode} from "../../../../../../../src/lib/node/expression/assign-name";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('AssignNameNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createAssignNameNode('foo', 1, 1);

        same(node.attributes.name, 'foo');
        same(node.type, 'assign_name');
        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();

        let node = createAssignNameNode('foo', 1, 1);

        same(compiler.compile(node).source, 'context.proxy[\`foo\`]');
        end();
    });
});

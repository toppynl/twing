import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../src/lib/node/expression/constant";
import {createNameNode} from "../../../../../../../src/lib/node/expression/name";
import {createNullishCoalescingNode} from "../../../../../../../src/lib/node/expression/nullish-coalescing";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('NullishCoalescingNode', ({test}) => {
    test('factory', ({same, end}) => {
        let left = createNameNode('foo', 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createNullishCoalescingNode([left, right], 1, 1);

        same(node.line, 1);
        same(node.column, 1);
        same(node.type, 'nullish_coalescing');
        same(node.is("nullish_coalescing"), true);
        same(node.is("conditional"), true);

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();

        let left = createNameNode('foo', 1, 1);
        let right = createConstantNode(2, 1, 1);
        let node = createNullishCoalescingNode([left, right], 1, 1);

        same(compiler.compile(node).source, `((!!((context.has(\`foo\`)) && !(await runtime.getTest(\'null\').traceableCallable(1, template.source)(...[context.get(\`foo\`)])))) ? (context.get(\`foo\`)) : (2))`);

        end();
    });
});

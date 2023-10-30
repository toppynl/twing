import * as tape from 'tape';
import {createFlushNode} from "../../../../../../src/lib/node/flush";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('FlushNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createFlushNode(1, 1, 'foo');

        same(node.children, {});
        same(node.type, 'flush');

        end();
    });

    test('compile', ({same, end}) => {
        let node = createFlushNode(1, 1, 'foo');
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.flush();
`);

        end();
    });
});

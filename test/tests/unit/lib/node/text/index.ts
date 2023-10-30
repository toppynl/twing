import * as tape from 'tape';
import {createTextNode} from "../../../../../../src/lib/node/text";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('TextBlock', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createTextNode('foo', 1, 1);

        same(node.attributes.data, 'foo');
        same(node.type, 'text');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        let node = createTextNode('foo', 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.echo(\`foo\`);
`);

        end();
    });
});

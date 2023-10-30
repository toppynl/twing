import * as tape from 'tape';
import {createVerbatimNode} from "../../../../../../src/lib/node/verbatim";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('VerbatimNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createVerbatimNode('foo', 1, 1, 'verbatim');

        same(node.attributes.data, 'foo');
        same(node.type, 'verbatim');
        same(node.line, 1);
        same(node.column, 1);
        same(node.getNodeTag(), 'verbatim');

        end();
    });

    test('compile', ({same, end}) => {
        let node = createVerbatimNode('foo', 1, 1, 'verbatim');
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.echo(\`foo\`);
`);

        end();
    });
});

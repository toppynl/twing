import * as tape from 'tape';
import {createTextNode} from "../../../../../../src/lib/node/text";
import {createBlockNode} from "../../../../../../src/lib/node/block";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('BlockNode', ({test}) => {
    test('factory', ({same, end}) => {
        let body = createTextNode('foo', 1, 1, null);
        let node = createBlockNode('foo', body, 1, 1);

        same(node.children.body, body);
        same(node.attributes.name, 'foo');
        same(node.type, 'block');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        let body = createTextNode('foo', 1, 1, null);
        let node = createBlockNode('foo', body, 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `async (context, outputBuffer, blocks = new Map()) => {
    let aliases = this.aliases.clone();
    outputBuffer.echo(\`foo\`);
}`);

        end();
    });
});

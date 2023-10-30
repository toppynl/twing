import * as tape from 'tape';
import {createBlockReferenceNode} from "../../../../../../src/lib/node/block-reference";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('BlockReferenceNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createBlockReferenceNode('foo', 1, 1);

        same(node.attributes.name, 'foo');
        same(node.type, 'block_reference');

        end();
    });

    test('compile', ({same, end}) => {
        let node = createBlockReferenceNode('foo', 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.echo(await this.traceableRenderBlock(1, this.source)(\'foo\', context.clone(), outputBuffer, blocks));
`);

        end();
    });
});

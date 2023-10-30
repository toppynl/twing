import * as tape from 'tape';
import {createEmbedNode} from "../../../../../../src/lib/node/include/embed";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('EmbedNode', ({test}) => {
    test('factory', ({same, end}) => {
        let variables = createConstantNode('foo', 1, 1);
        let node = createEmbedNode('foo', 1, variables, false, false, 1, 1, 'embed');

        same(node.children.variables, variables);
        same(node.attributes.templateName, 'foo');
        same(node.attributes.index, 1);
        same(node.type, 'embed');

        end();
    });

    test('compile', ({same, end}) => {
        let node = createEmbedNode('foo', 1, createConstantNode('bar', 1, 1), false, false, 1, 1, 'embed');
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.echo(await this.include(context, outputBuffer, await this.loadTemplate(\`foo\`, 1, 1), \`bar\`, true, false, 1));
`);

        end();
    });
});

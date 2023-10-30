import * as tape from 'tape';
import {createBaseNode} from "../../../../../../src/lib/node";
import {createAutoEscapeNode} from "../../../../../../src/lib/node/auto-escape";
import {createMockCompiler} from "../../../../../mock/compiler";
import {createTextNode} from "../../../../../../src/lib/node/text";

tape('AutoEscapeNode', ({test}) => {
    test('factory', ({same, end}) => {
        let body = createBaseNode(null, {}, {
            0: createTextNode('foo', 1, 1)
        });
        let node = createAutoEscapeNode(false, body, 1, 1);

        same(node.children.body, body);
        same(node.attributes.strategy, false);
        same(node.type, 'auto_escape');

        end();
    });

    test('compile', ({same, end}) => {
        let body = createBaseNode(null, {}, {
            0: createTextNode('foo', 1, 1)
        });
        let node = createAutoEscapeNode(false, body, 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.echo(\`foo\`);
`);

        end();
    });
});

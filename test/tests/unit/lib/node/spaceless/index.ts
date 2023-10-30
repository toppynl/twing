import * as tape from 'tape';
import {createTextNode} from "../../../../../../src/lib/node/text";
import {createBaseNode} from "../../../../../../src/lib/node";
import {createSpacelessNode} from "../../../../../../src/lib/node/spaceless";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('SpacelessNode', ({test}) => {
    test('factory', ({same, end}) => {
        const body = createBaseNode(null, {}, {
            0: createTextNode('<div>   <div>   foo   </div>   </div>', 1, 1)
        });
        const node = createSpacelessNode(body, 1, 1);

        same(node.children.body, body);
        same(node.type, 'spaceless');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        const body = createBaseNode(null, {}, {
            0: createTextNode('<div>   <div>   foo   </div>   </div>', 1, 1)
        });
        const node = createSpacelessNode(body, 1, 1);
        const compiler = createMockCompiler();

        same(compiler.compile(node).source, `outputBuffer.start();
outputBuffer.echo(\`<div>   <div>   foo   </div>   </div>\`);
outputBuffer.echo(outputBuffer.getAndClean().replace(/>\\s+</g, '><').trim());
`);

        end();
    });
});

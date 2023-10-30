import * as tape from 'tape';
import {createBodyNode} from "../../../../../../src/lib/node/body";
import {createTextNode} from "../../../../../../src/lib/node/text";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('BodyNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createBodyNode(createTextNode('foo', 1, 1), 1, 1);

        same(node.children.content.type, 'text');

        end();
    });

    test('compile', ({same, end}) => {
        let node = createBodyNode(createTextNode('foo', 1, 1), 1, 1);

        const compiler = createMockCompiler();

        compiler.compile(node);

        same(compiler.source, 'outputBuffer.echo(`foo`);\n');

        end();
    });
});

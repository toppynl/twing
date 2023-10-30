import * as tape from 'tape';
import {createParentNode} from "../../../../../../../src/lib/node/expression/parent";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('ParentNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createParentNode('foo', 1, 1);

        same(node.attributes.name, 'foo');
        same(node.type, 'parent');

        end();
    });

    test('compile', ({test, same}) => {
        let compiler = createMockCompiler();

        let node = createParentNode('foo', 1, 1);

        same(compiler.compile(node).source, 'await this.traceableRenderParentBlock(1, this.source)(\`foo\`, context, outputBuffer, blocks)');

        test('with special character', ({same, end}) => {
            let node = createParentNode('£', 1, 1);

            same(compiler.compile(node).source, 'await this.traceableRenderParentBlock(1, this.source)(\`£\`, context, outputBuffer, blocks)');

            end();
        });
    });
});

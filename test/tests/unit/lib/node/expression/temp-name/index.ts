import * as tape from 'tape';
import {createMockCompiler} from "../../../../../../mock/compiler";
import {createTemporaryNameNode} from "../../../../../../../src/lib/node/expression/temp-name";

tape('TemporaryNameNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createTemporaryNameNode('foo', false, 1, 1);

        same(node.line, 1);
        same(node.column, 1);
        same(node.type, 'temp_name');

        end();
    });

    test('compile', ({test}) => {
        test('with declaration set to false', ({same, end}) => {
            let compiler = createMockCompiler();

            let node = createTemporaryNameNode('foo', false, 1, 1);

            same(compiler.compile(node).source, `$_foo_`);

            end();
        });

        test('with declaration set to true', ({same, end}) => {
            let compiler = createMockCompiler();

            let node = createTemporaryNameNode('foo', true, 1, 1);

            same(compiler.compile(node).source, `let $_foo_`);

            end();
        });
    });
});

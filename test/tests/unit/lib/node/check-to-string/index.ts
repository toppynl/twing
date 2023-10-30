import * as tape from 'tape';
import {createMockCompiler} from "../../../../../mock/compiler";
import {createCheckToStringNode} from "../../../../../../src/lib/node/check-to-string";
import {createNameNode} from "../../../../../../src/lib/node/expression/name";

tape('CheckToStringNode', ({test}) => {
    test('factory', ({same, end}) => {
        let node = createCheckToStringNode(createNameNode('foo', 1, 1), 1, 1);

        same(node.type, 'check_to_string');

        end();
    });

    test('compile', ({same, end}) => {
        let node = createCheckToStringNode(createNameNode('foo', 1, 1), 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `this.environment.ensureToStringAllowed((context.has(\`foo\`) ? context.get(\`foo\`) : null))`);

        end();
    })
});

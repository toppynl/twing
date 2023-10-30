import * as tape from 'tape';
import {createForLoopNode} from "../../../../../../src/lib/node/for-loop";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('ForLoopNode', ({test}) => {
    test('factory', ({same, end, equals}) => {
        let node = createForLoopNode(1, 1);

        equals(node.getNodeTag(), null);
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({test}) => {
        test('with with_loop set to true', ({same, end}) => {
            let node = createForLoopNode(1, 1);
            let compiler = createMockCompiler();

            node.attributes.with_loop = true;

            same(compiler.compile(node).source, `(() => {
    let loop = context.get('loop');
    loop.set('index0', loop.get('index0') + 1);
    loop.set('index', loop.get('index') + 1);
    loop.set('first', false);
    if (loop.has('length')) {
        loop.set('revindex0', loop.get('revindex0') - 1);
        loop.set('revindex', loop.get('revindex') - 1);
        loop.set('last', loop.get('revindex0') === 0);
    }
})();
`);

            end();
        });
    });
});

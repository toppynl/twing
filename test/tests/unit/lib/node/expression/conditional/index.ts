import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../src/lib/node/expression/constant";
import {createConditionalNode} from "../../../../../../../src/lib/node/expression/conditional";
import {createMockCompiler} from "../../../../../../mock/compiler";

tape('ConditionalNode', ({test}) => {
    test('factory', ({same, end}) => {
        let expr1 = createConstantNode(1, 1, 1);
        let expr2 = createConstantNode(2, 1, 1);
        let expr3 = createConstantNode(3, 1, 1);
        let node = createConditionalNode(expr1, expr2, expr3, 1, 1);

        same(node.children.expr1, expr1);
        same(node.children.expr2, expr2);
        same(node.children.expr3, expr3);

        end();
    });

    test('compile', ({same, end}) => {
        let compiler = createMockCompiler();

        let expr1 = createConstantNode(1, 1, 1);
        let expr2 = createConstantNode(2, 1, 1);
        let expr3 = createConstantNode(3, 1, 1);
        let node = createConditionalNode(expr1, expr2, expr3, 1, 1);

        same(compiler.compile(node).source, '((1) ? (2) : (3))');

        end();
    });
});

import * as tape from "tape";
import {createMethodCallNode} from "../../../../../../../src/lib/node/expression/method-call";
import {createNameNode} from "../../../../../../../src/lib/node/expression/name";
import {createArrayNode} from "../../../../../../../src/lib/node/expression/array";
import {createMockCompiler} from "../../../../../../mock/compiler";
import {createConstantNode} from "../../../../../../../src/lib/node/expression/constant";

tape('MethodCallNode', ({test}) => {
    test('compile', ({test}) => {
        test('with "is_defined_test" attribute set to false', ({same, end}) => {
            const candidate = createMethodCallNode(
                createNameNode('foo', 1, 1),
                'bar',
                createArrayNode({
                    0: createConstantNode('key1', 1, 1),
                    1: createConstantNode('arg1', 1, 1)
                }, 1, 1),
                1, 1
            );

            candidate.attributes.is_defined_test = false;

            const compiler = createMockCompiler();

            compiler.compile(candidate);

            same(compiler.source, 'await this.callMacro(aliases.proxy[`foo`], `bar`, outputBuffer, [`arg1`], 1, context, this.source)');

            end();
        });

        test('with "is_defined_test" attribute set to true', ({same, end}) => {
            const candidate = createMethodCallNode(
                createNameNode('foo', 1, 1),
                'bar',
                createArrayNode({
                    0: createConstantNode('key1', 1, 1),
                    1: createConstantNode('arg1', 1, 1)
                }, 1, 1),
                1, 1
            );

            candidate.attributes.is_defined_test = true;

            const compiler = createMockCompiler();

            compiler.compile(candidate);

            same(compiler.source, '(await aliases.proxy[`foo`].hasMacro(`bar`))');

            end();
        });
    });
});

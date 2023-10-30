import * as tape from 'tape';
import {createConstantNode} from "../../../../../../../../../src/lib/node/expression/constant";
import {createDefinedTestNode} from "../../../../../../../../../src/lib/node/expression/call/test/defined";
import {createNegativeNode} from "../../../../../../../../../src/lib/node/expression/unary/neg";
import {MockEnvironment} from "../../../../../../../../mock/environment";
import {createMockCompiler} from "../../../../../../../../mock/compiler";
import {createArgumentsNode} from "../../../../../../../../../src/lib/node/expression/arguments";

tape('DefinedTestNode', ({test}) => {
    test('factory', ({test}) => {
        test('can only be applied to "simple" variables', ({same, fail, end}) => {
            try {
                createDefinedTestNode(
                    createNegativeNode(createConstantNode('foo', 1, 1), 1, 1),
                    createArgumentsNode({}, 1, 1),
                    1, 1
                );

                fail();
            } catch (e) {
                same(e.message, 'The "defined" test only works with simple variables at line 1.');
            }

            end();
        });
    });

    test('compile', ({same, end}) => {
        const environment = new MockEnvironment();
        const compiler = createMockCompiler(environment);

        const candidate = createDefinedTestNode(
            createConstantNode('foo', 1, 1),
            createArgumentsNode({}, 1, 1),
            1, 1
        );

        compiler.compile(candidate);

        same(compiler.source, 'true');

        end();
    });
});

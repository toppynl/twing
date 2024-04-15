import * as tape from "tape";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {TwingRuntimeError} from "../../../../../../src/lib/error/runtime";
import {executeUnaryNode} from "../../../../../../src/lib/node-executor/expression/unary";
import {createBaseUnaryNode} from "../../../../../../src/lib/node/expression/unary";
import type {TwingExecutionContext} from "../../../../../../src/lib/execution-context";

tape('executeUnaryNode', ({test}) => {
    test('throws on unrecognized node type', ({same, fail, end}) => {
        return executeUnaryNode(createBaseUnaryNode("foo", createConstantNode(0, 0, 0), 0, 0), {
            template: {
                source: {
                    code: 'code',
                    name: 'name'
                }
            }
        } as TwingExecutionContext)
            .then(fail)
            .catch((error: TwingRuntimeError) => {
                same(error.message, 'Unrecognized unary node of type "foo" in "name" at line 0, column 0');
                same(error.name, 'TwingRuntimeError');

            })
            .finally(end);
    });
});

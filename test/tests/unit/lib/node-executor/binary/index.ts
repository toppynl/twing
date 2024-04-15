import * as tape from "tape";
import {executeBinaryNode} from "../../../../../../src/lib/node-executor/expression/binary";
import {createBaseBinaryNode} from "../../../../../../src/lib/node/expression/binary";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {TwingRuntimeError} from "../../../../../../src/lib/error/runtime";
import type {TwingExecutionContext} from "../../../../../../src/lib/execution-context";

tape('executeBinaryNode => ::()', ({test}) => {
    test('throws on unrecognized node type', ({same, fail, end}) => {
        return executeBinaryNode(createBaseBinaryNode("foo", [
            createConstantNode(0, 0, 0),
            createConstantNode(0, 0, 0)
        ], 0, 0), {
            template: {
                source: {
                    code: 'code',
                    name: 'name'
                }
            }
        } as TwingExecutionContext)
            .then(fail)
            .catch((error: TwingRuntimeError) => {
                same(error.message, 'Unrecognized binary node of type "foo" in "name" at line 0, column 0');
                same(error.name, 'TwingRuntimeError');
            })
            .finally(end);
    });
});

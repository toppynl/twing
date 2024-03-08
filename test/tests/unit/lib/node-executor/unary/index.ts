import * as tape from "tape";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {TwingRuntimeError} from "../../../../../../src/lib/error/runtime";
import {executeUnaryNode} from "../../../../../../src/lib/node-executor/expression/unary";
import {createBaseUnaryNode} from "../../../../../../src/lib/node/expression/unary";

tape('executeUnaryNode', ({test}) => {
    test('throws on unrecognized node type', ({same, fail, end}) => {
        return executeUnaryNode(createBaseUnaryNode("foo", createConstantNode(0, 0, 0), 0, 0), {} as any)
            .then(fail)
            .catch((error: TwingRuntimeError) => {
                same(error.message, 'Unrecognized unary node of type "foo" at line 0, column 0');
                same(error.name, 'TwingRuntimeError');

            })
            .finally(end);
    });
});

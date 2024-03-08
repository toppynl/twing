import * as tape from "tape";
import {TwingRuntimeError} from "../../../../../../src/lib/error/runtime";
import {createBaseNode} from "../../../../../../src/lib/node";
import {executeNode} from "../../../../../../src/lib/node-executor";

tape('executeNode => ::()', ({test}) => {
    test('throws on unrecognized node type', ({same, fail, end}) => {
        return executeNode(createBaseNode("foo", {}, {}, 0, 0), {} as any)
            .then(fail)
            .catch((error: TwingRuntimeError) => {
                same(error.message, 'Unrecognized node of type "foo" at line 0, column 0');
                same(error.name, 'TwingRuntimeError');
            })
            .finally(end);
    });
});

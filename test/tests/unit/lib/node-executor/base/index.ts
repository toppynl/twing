import * as tape from "tape";
import {TwingRuntimeError} from "../../../../../../src/lib/error/runtime";
import {createBaseNode} from "../../../../../../src/lib/node";
import {executeNode} from "../../../../../../src/lib/node-executor";
import type {TwingExecutionContext} from "../../../../../../src/lib/execution-context";

tape('executeNode => ::()', ({test}) => {
    test('throws on unrecognized node type', ({same, fail, end}) => {
        return executeNode(createBaseNode("foo", {}, {}, 0, 0), {
            template: {
                source: {
                    code: 'code',
                    name: 'name'
                }
            }
        } as TwingExecutionContext)
            .then(fail)
            .catch((error: TwingRuntimeError) => {
                same(error.message, 'Unrecognized node of type "foo" in "name" at line 0, column 0');
                same(error.name, 'TwingRuntimeError');
            })
            .finally(end);
    });
});

import * as tape from "tape";
import {TwingRuntimeError} from "../../../../../../main/lib/error/runtime";
import {createBaseNode} from "../../../../../../main/lib/node";
import {executeNode, executeNodeSynchronously} from "../../../../../../main/lib/node-executor";
import type {
    TwingExecutionContext,
    TwingSynchronousExecutionContext
} from "../../../../../../main/lib/execution-context";

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

tape('executeNodeSynchronously => ::()', ({test}) => {
    test('throws on unrecognized node type', ({same, fail, end}) => {
        try {
            return executeNodeSynchronously(createBaseNode("foo", {}, {}, 0, 0), {
                template: {
                    source: {
                        code: 'code',
                        name: 'name'
                    }
                }
            } as TwingSynchronousExecutionContext);
            
            fail();
        }
        catch (error) {
            same((error as Error).message, 'Unrecognized node of type "foo" in "name" at line 0, column 0');
            same((error as Error).name, 'TwingRuntimeError');
        }
        finally {
            end();
        }
    });
});

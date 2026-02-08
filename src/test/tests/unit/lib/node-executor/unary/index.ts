import tape from "tape";
import {createConstantNode} from "../../../../../../main/lib/node/expression/constant";
import {TwingRuntimeError} from "../../../../../../main/lib/error/runtime";
import {
    executeUnaryNode,
    executeUnaryNodeSynchronously
} from "../../../../../../main/lib/node-executor/expression/unary";
import {createBaseUnaryNode} from "../../../../../../main/lib/node/expression/unary";
import type {
    TwingExecutionContext,
    TwingSynchronousExecutionContext
} from "../../../../../../main/lib/execution-context";

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

tape('executeUnaryNodeSynchronously', ({test}) => {
    test('throws on unrecognized node type', ({same, fail, end}) => {
        try {
            return executeUnaryNodeSynchronously(createBaseUnaryNode("foo", createConstantNode(0, 0, 0), 0, 0), {
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
            same((error as Error).message, 'Unrecognized unary node of type "foo" in "name" at line 0, column 0');
            same((error as Error).name, 'TwingRuntimeError');
        }
        finally {
            end();
        }
    });
});

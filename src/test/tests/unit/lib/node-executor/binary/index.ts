import * as tape from "tape";
import {
    executeBinaryNode,
    executeBinaryNodeSynchronously
} from "../../../../../../main/lib/node-executor/expression/binary";
import {createBaseBinaryNode} from "../../../../../../main/lib/node/expression/binary";
import {createConstantNode} from "../../../../../../main/lib/node/expression/constant";
import {TwingRuntimeError} from "../../../../../../main/lib/error/runtime";
import type {
    TwingExecutionContext,
    TwingSynchronousExecutionContext
} from "../../../../../../main/lib/execution-context";

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

tape('executeBinaryNodeSynchronously => ::()', ({test}) => {
    test('throws on unrecognized node type', ({same, fail, end}) => {
        try {
            executeBinaryNodeSynchronously(createBaseBinaryNode("foo", [
                createConstantNode(0, 0, 0),
                createConstantNode(0, 0, 0)
            ], 0, 0), {
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
            same((error as Error).message, 'Unrecognized binary node of type "foo" in "name" at line 0, column 0');
            same((error as Error).name, 'TwingRuntimeError');
        }
        finally {
            end();
        }
    });
});

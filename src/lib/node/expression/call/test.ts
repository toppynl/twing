import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingBaseNode} from "../../../node";
import type {TwingArrayNode} from "../array";
import {TwingCompilationError} from "../../../error/compilation";

export const testNodeType = "test";

export interface TwingTestNode extends TwingBaseCallNode<typeof testNodeType> {
}

export const createTestNode = (
    operand: TwingBaseNode,
    testName: string,
    testArguments: TwingArrayNode,
    line: number,
    column: number
): TwingTestNode => {
    const callType = 'test';

    const baseNode = createBaseCallNode(testNodeType, {
        type: callType,
        operatorName: testName,
    }, {
        operand,
        arguments: testArguments
    }, line, column);

    const node: TwingTestNode = {
        ...baseNode,
        compile: (compiler) => {
            const name = node.attributes.operatorName;
            const test = compiler.environment.getTest(name);
            
            if (test === null) {
                throw new TwingCompilationError(`Unknown test "${name}".`, node.line);
            }
            
            baseNode.compileCallable(
                compiler,
                name,
                callType,
                test
            );
        }
    };

    return node;
};

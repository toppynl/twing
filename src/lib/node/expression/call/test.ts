import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingBaseNode} from "../../../node";
import type {TwingArrayNode} from "../array";

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
    const node = createBaseCallNode(testNodeType, testName, operand, testArguments, line, column);
    
    return node;
};

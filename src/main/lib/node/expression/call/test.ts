import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingBaseNode} from "../../../node";
import type {TwingArrayNode} from "../array";

export interface TwingTestNode extends TwingBaseCallNode<"test"> {
}

export const createTestNode = (
    operand: TwingBaseNode,
    testName: string,
    testArguments: TwingArrayNode,
    line: number,
    column: number
): TwingTestNode => {
    return createBaseCallNode("test", testName, operand, testArguments, line, column);
};

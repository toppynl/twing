import {BaseConditionalNode, conditionalNodeType, createBaseConditionalNode} from "./conditional";
import {BaseExpressionNode} from "../expression";
import {createDefinedTestNode} from "./call/test/defined";
import {createNotNode} from "./unary/not";
import {createAndNode} from "./binary/and";
import {createTestNode} from "./call/test";
import {createArrayNode} from "./array";

export const nullishCoalescingNodeType = "nullish_coalescing";

export interface NullishCoalescingNode extends BaseConditionalNode<typeof nullishCoalescingNodeType> {
}

export const createNullishCoalescingNode = (
    operands: [BaseExpressionNode, BaseExpressionNode],
    line: number,
    column: number
): NullishCoalescingNode => {
    const [left, right] = operands;
    
    if (left.is("name")) {
        left.attributes.isAlwaysDefined = true;
    }
    
    const testNode = createAndNode(
        [
            createDefinedTestNode(left, createArrayNode([], line, column), line, column),
            createNotNode(
                createTestNode(
                    left,
                    'null',
                    createArrayNode([], line, column),
                    line, column
                ),
                line,
                column
            )
        ],
        line,
        column
    );

    const baseNode = createBaseConditionalNode(nullishCoalescingNodeType, testNode, left, right, line, column);
    
    const node: NullishCoalescingNode = {
        ...baseNode,
        is: (aType) => aType === node.type || aType === conditionalNodeType
    };

    return node;
};

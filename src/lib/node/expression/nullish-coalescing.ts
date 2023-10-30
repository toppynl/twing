import {BaseConditionalNode, conditionalNodeType, createBaseConditionalNode} from "./conditional";
import {ExpressionNode} from "../expression";
import {createDefinedTestNode} from "./call/test/defined";
import {createNotNode} from "./unary/not";
import {createAndNode} from "./binary/and";
import {createTestNode} from "./call/test";
import {createArgumentsNode} from "./arguments";

export const nullishCoalescingNodeType = "nullish_coalescing";

export interface NullishCoalescingNode extends BaseConditionalNode<typeof nullishCoalescingNodeType> {
}

export const createNullishCoalescingNode = (
    operands: [ExpressionNode, ExpressionNode],
    line: number,
    column: number
): NullishCoalescingNode => {
    const [left, right] = operands;

    const testNode = createAndNode(
        [
            createDefinedTestNode(left.clone(), createArgumentsNode({}, line, column), line, column),
            createNotNode(
                createTestNode(
                    left,
                    'null',
                    createArgumentsNode({}, line, column),
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
        compile: (compiler) => {
            const {expr2} = baseNode.children;

            if (expr2.type === "name") {
                expr2.attributes.always_defined = true;
            }

            baseNode.compile(compiler);
        },
        is: (aType) => aType === node.type || aType === conditionalNodeType
    };

    return node;
};

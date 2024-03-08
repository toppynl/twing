import {TwingBaseArrayNode, createBaseArrayNode} from "./array";
import type {TwingBaseExpressionNode} from "../expression";

export interface TwingHashNode extends TwingBaseArrayNode<"hash"> {
}

export const createHashNode = (
    elements: Array<{
        key: TwingBaseExpressionNode;
        value: TwingBaseExpressionNode;
    }>,
    line: number,
    column: number
): TwingHashNode => {
    return createBaseArrayNode("hash", elements, line, column);
};

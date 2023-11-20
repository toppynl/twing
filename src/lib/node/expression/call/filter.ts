import {TwingBaseNode} from "../../../node";
import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingArrayNode} from "../array";

export const filterNodeType = "filter";

export interface TwingFilterNode extends TwingBaseCallNode<typeof filterNodeType, TwingBaseNode> {
}

export const createFilterNode = (
    operand: TwingBaseNode,
    filterName: string,
    filterArguments: TwingArrayNode,
    line: number,
    column: number
): TwingFilterNode => {
    const node = createBaseCallNode(filterNodeType, filterName, operand, filterArguments, line, column);

    return node;
};

import {TwingBaseNode} from "../../../node";
import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingArrayNode} from "../array";

export interface TwingFilterNode extends TwingBaseCallNode<"filter"> {
}

export const createFilterNode = (
    operand: TwingBaseNode,
    filterName: string,
    filterArguments: TwingArrayNode,
    line: number,
    column: number
): TwingFilterNode => {
    return createBaseCallNode("filter", filterName, operand, filterArguments, line, column);
};

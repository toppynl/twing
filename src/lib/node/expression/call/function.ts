import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingArrayNode} from "../array";

export interface TwingFunctionNode extends TwingBaseCallNode<"function"> {
}

export const createFunctionNode = (
    functionName: string,
    functionArguments: TwingArrayNode,
    line: number,
    column: number
): TwingFunctionNode => {
    const node = createBaseCallNode("function", functionName, null, functionArguments, line, column);

    return node;
};

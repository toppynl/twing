import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingArrayNode} from "../array";

export const functionNodeType = "function";

export interface TwingFunctionNode extends TwingBaseCallNode<typeof functionNodeType, undefined> {
}

export const createFunctionNode = (
    functionName: string,
    functionArguments: TwingArrayNode,
    line: number,
    column: number
): TwingFunctionNode => {
    const node = createBaseCallNode(functionNodeType, functionName, undefined, functionArguments, line, column);

    return node;
};

import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {TwingBaseNode} from "../../node";

export type TwingBlockFunctionNodeAttributes = TwingBaseExpressionNodeAttributes & {
    shouldTestExistence: boolean;
};

export type TwingBlockFunctionNodeChildren = {
    name: TwingBaseNode;
    template?: TwingBaseNode;
};

export interface TwingBlockFunctionNode extends TwingBaseExpressionNode<"block_function", TwingBlockFunctionNodeAttributes, TwingBlockFunctionNodeChildren> {
}

export const createBlockFunctionNode = (
    name: TwingBaseNode,
    template: TwingBaseNode | null,
    line: number,
    column: number,
    tag?: string
): TwingBlockFunctionNode => {
    const children: TwingBlockFunctionNodeChildren = {
        name
    };

    if (template) {
        children.template = template;
    }

    return createBaseExpressionNode("block_function", {
        shouldTestExistence: false
    }, children, line, column, tag);
};

export const cloneBlockReferenceExpressionNode = (
    blockFunctionNode: TwingBlockFunctionNode
): TwingBlockFunctionNode => {
    return createBlockFunctionNode(
        blockFunctionNode.children.name,
        blockFunctionNode.children.template || null,
        blockFunctionNode.line,
        blockFunctionNode.column
    );
};

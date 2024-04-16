import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";

export type TwingWithNodeAttributes = TwingBaseNodeAttributes & {
    only: boolean;
};

export type TwingWithNodeChildren = {
    body: TwingBaseNode;
    variables?: TwingBaseExpressionNode;
};

export interface TwingWithNode extends TwingBaseNode<"with", TwingWithNodeAttributes, TwingWithNodeChildren> {
}

export const createWithNode = (
    body: TwingBaseNode,
    variables: TwingBaseExpressionNode | null,
    only: boolean,
    line: number,
    column: number,
    tag: string
): TwingWithNode => {
    const children: TwingWithNodeChildren = {
        body
    };

    if (variables) {
        children.variables = variables;
    }

    return createBaseNode("with", {
        only
    }, children, line, column, tag);
};

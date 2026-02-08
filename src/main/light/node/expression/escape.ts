import {TwingBaseNodeAttributes, TwingBaseNode} from "../../node";
import {TwingBaseExpressionNode, createBaseExpressionNode} from "../expression";

export interface TwingEscapeNodeAttributes extends TwingBaseNodeAttributes {
    strategy: string;
}

export interface TwingEscapeNode extends TwingBaseExpressionNode<"escape", TwingEscapeNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createEscapeNode = (
    body: TwingBaseNode,
    strategy: string
): TwingEscapeNode => {
    return createBaseExpressionNode("escape", {
        strategy
    }, {
        body
    }, body.line, body.column);
};

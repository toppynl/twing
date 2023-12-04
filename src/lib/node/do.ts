import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingBaseExpressionNode} from "./expression";

/**
 * Represents a do node.
 *
 * The do tag works exactly like the regular variable expression ({{ ... }}) just that it doesn't print anything:
 * {% do 1 + 2 %}
 */
export interface TwingDoNode extends TwingBaseNode<"do", TwingBaseNodeAttributes, {
    body: TwingBaseExpressionNode;
}> {
}

export const createDoNode = (
    body: TwingBaseExpressionNode,
    line: number,
    column: number,
    tag: string | null
): TwingDoNode => {
    const baseNode = createBaseNode("do", {}, {
        body
    }, line, column, tag);

    return {
        ...baseNode,
        execute: baseNode.children.body.execute
    };
};

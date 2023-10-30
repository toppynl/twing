import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import type {ExpressionNode} from "./expression";

/**
 * Represents a do node.
 *
 * The do tag works exactly like the regular variable expression ({{ ... }}) just that it doesn't print anything:
 * {% do 1 + 2 %}
 */
export interface DoNode extends BaseNode<"do", BaseNodeAttributes, {
    expr: ExpressionNode;
}> {
}

export const createDoNode = (
    expr: ExpressionNode,
    line: number,
    column: number,
    tag: string = null
): DoNode => {
    const baseNode = createBaseNode("do", {}, {
        expr
    }, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .subCompile(baseNode.children.expr, true)
                .raw(";\n")
            ;
        }
    };
};

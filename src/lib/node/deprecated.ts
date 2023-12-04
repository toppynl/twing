import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";

export interface TwingDeprecatedNode extends TwingBaseNode<"deprecated", TwingBaseNodeAttributes, {
    expr: TwingBaseExpressionNode;
}> {
}

export const createDeprecatedNode = (
    expr: TwingBaseExpressionNode,
    line: number,
    column: number,
    tag: string
): TwingDeprecatedNode => {
    const baseNode = createBaseNode("deprecated", {}, {
        expr
    }, line, column, tag);

    const node: TwingDeprecatedNode = {
        ...baseNode,
        execute: (executionContext) => {
            const {template} = executionContext;
            const {expr} = node.children;

            return expr.execute(executionContext)
                .then((message) => {
                    console.warn(`${message} ("${template.name}" at line ${node.line}, column ${node.column})`);
                });
        }
    };

    return node;
};

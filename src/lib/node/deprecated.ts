import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";

export interface TwingDeprecatedNode extends TwingBaseNode<"deprecated", TwingBaseNodeAttributes, {
    message: TwingBaseExpressionNode;
}> {
}

export const createDeprecatedNode = (
    message: TwingBaseExpressionNode,
    line: number,
    column: number,
    tag: string
): TwingDeprecatedNode => {
    const baseNode = createBaseNode("deprecated", {}, {
        message
    }, line, column, tag);

    const deprecatedNode: TwingDeprecatedNode = {
        ...baseNode,
        execute: (executionContext) => {
            const {template} = executionContext;
            const {message} = deprecatedNode.children;

            return message.execute(executionContext)
                .then((message) => {
                    console.warn(`${message} ("${template.name}" at line ${deprecatedNode.line}, column ${deprecatedNode.column})`);
                });
        }
    };

    return deprecatedNode;
};

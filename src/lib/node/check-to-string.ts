import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import {BaseExpressionNode} from "./expression";

/**
 * Checks if casting an expression to toString() is allowed by the sandbox.
 *
 * For instance, when there is a simple Print statement, like {{ article }},
 * and if the sandbox is enabled, we need to check that the toString()
 * method is allowed if 'article' is an object. The same goes for {{ article|upper }}
 * or {{ random(article) }}.
 */
export interface CheckToStringNode extends BaseNode<"check_to_string", BaseNodeAttributes, {
    expr: BaseExpressionNode;
}> {
}

export const createCheckToStringNode = (
    expression: BaseExpressionNode,
    line: number,
    column: number
): CheckToStringNode => {
    const baseNode = createBaseNode("check_to_string", {}, {
        expr: expression
    }, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .raw('runtime.ensureToStringAllowed(')
                .subCompile(baseNode.children.expr)
                .raw(')')
            ;
        }
    }
};

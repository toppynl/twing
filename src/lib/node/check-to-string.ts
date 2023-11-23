import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";

/**
 * Checks if casting an expression to toString() is allowed by the sandbox.
 *
 * For instance, when there is a simple Print statement, like {{ article }},
 * and if the sandbox is enabled, we need to check that the toString()
 * method is allowed if 'article' is an object. The same goes for {{ article|upper }}
 * or {{ random(article) }}.
 */
export interface TwingCheckToStringNode extends TwingBaseNode<"check_to_string", TwingBaseNodeAttributes, {
    expr: TwingBaseExpressionNode;
}> {
}

export const createCheckToStringNode = (
    expression: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingCheckToStringNode => {
    const baseNode = createBaseNode("check_to_string", {}, {
        expr: expression
    }, line, column);

    return {
        ...baseNode,
        execute: (...args) => {
            const [template] = args;
            const {expr} = baseNode.children;
            
            return expr.execute(...args)
                .then((value) => {
                    template.assertToStringAllowed(value);

                    return value;
                });
        }
    }
};

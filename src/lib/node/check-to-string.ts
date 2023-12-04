import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";
import {getTraceableMethod} from "../helpers/traceable-method";

/**
 * Checks if casting an expression to toString() is allowed by the sandbox.
 *
 * For instance, when there is a simple Print statement, like {{ article }},
 * and if the sandbox is enabled, we need to check that the toString()
 * method is allowed if 'article' is an object. The same goes for {{ article|upper }}
 * or {{ random(article) }}.
 */
export interface TwingCheckToStringNode extends TwingBaseNode<"check_to_string", TwingBaseNodeAttributes, {
    value: TwingBaseExpressionNode;
}> {
}

export const createCheckToStringNode = (
    value: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingCheckToStringNode => {
    const baseNode = createBaseNode("check_to_string", {}, {
        value
    }, line, column);

    return {
        ...baseNode,
        execute: (executionContext) => {
            const {template, sandboxed} = executionContext;
            const {value: valueNode} = baseNode.children;

            return valueNode.execute(executionContext)
                .then((value) => {
                    if (sandboxed) {
                        const assertToStringAllowed = getTraceableMethod((value: any) => {
                            if ((value !== null) && (typeof value === 'object')) {
                                try {
                                    template.checkMethodAllowed(value, 'toString');
                                } catch (error) {
                                    return Promise.reject(error);
                                }
                            }

                            return Promise.resolve(value);
                        }, valueNode.line, valueNode.column, template.name)

                        return assertToStringAllowed(value);
                    }

                    return value;
                });
        }
    }
};

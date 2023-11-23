import {TwingBaseNode, TwingBaseNodeAttributes} from "../../node";
import {TwingBaseExpressionNode, createBaseExpressionNode} from "../expression";

export interface TwingEscapeNodeAttributes extends TwingBaseNodeAttributes {
    strategy: string | true;
}

export interface TwingEscapeNode extends TwingBaseExpressionNode<"escape", TwingEscapeNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createEscapeNode = (
    body: TwingBaseNode,
    strategy: string | true,
    line: number,
    column: number
): TwingEscapeNode => {
    const baseNode = createBaseExpressionNode("escape", {
        strategy
    }, {
        body
    }, line, column);

    const node: TwingEscapeNode = {
        ...baseNode,
        execute: (...args) => {
            const [template] = args;
            const {environment} = template;
            const {strategy} = node.attributes;
            const {body} = node.children;

            return body.execute(...args)
                .then((value) => {
                    const escape = template.getTraceableMethod(environment.escape, node.line, node.column, template.templateName);

                    return escape(template, value, strategy, null, true);
                });
        }
    };

    return node;
};

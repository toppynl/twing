import {TwingBaseNodeAttributes} from "../../node";
import {TwingBaseExpressionNode, createBaseExpressionNode} from "../expression";
import {TwingBaseOutputNode} from "../output";

export interface TwingEscapeNodeAttributes extends TwingBaseNodeAttributes {
    strategy: string;
}

export interface TwingEscapeNode extends TwingBaseExpressionNode<"escape", TwingEscapeNodeAttributes, {
    body: TwingBaseOutputNode<any>;
}> {
}

export const createEscapeNode = (
    body: TwingBaseOutputNode<any>,
    strategy: string
): TwingEscapeNode => {
    const baseNode = createBaseExpressionNode("escape", {
        strategy
    }, {
        body
    }, body.line, body.column);

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

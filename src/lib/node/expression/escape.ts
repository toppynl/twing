import {TwingBaseNodeAttributes} from "../../node";
import {TwingBaseExpressionNode, createBaseExpressionNode} from "../expression";
import {TwingBaseOutputNode} from "../output";
import {getTraceableMethod} from "../../helpers/traceable-method";

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

    const escapeNode: TwingEscapeNode = {
        ...baseNode,
        execute: (executionContext) => {
            const {template} = executionContext;
            const {strategy} = escapeNode.attributes;
            const {body} = escapeNode.children;

            return body.execute(executionContext)
                .then((value) => {
                    const escape = getTraceableMethod(template.escape, escapeNode.line, escapeNode.column, template.name);

                    return escape(value, strategy, null, true);
                });
        }
    };

    return escapeNode;
};

import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode, TwingExpressionNode
} from "../expression";
import {getAttribute} from "../../helpers/get-attribute";
import {getTraceableMethod} from "../../helpers/traceable-method";

export type TwingAttributeAccessorCallType = "any" | "array" | "method";

export type TwingAttributeAccessorNodeAttributes = TwingBaseExpressionNodeAttributes & {
    isOptimizable: boolean;
    type: TwingAttributeAccessorCallType;
    shouldIgnoreStrictCheck?: boolean;
    shouldTestExistence: boolean;
};

export type TwingAttributeAccessorNodeChildren = {
    target: TwingExpressionNode;
    attribute: TwingExpressionNode;
    arguments: TwingExpressionNode;
};

export interface TwingAttributeAccessorNode extends TwingBaseExpressionNode<"attribute_accessor", TwingAttributeAccessorNodeAttributes, TwingAttributeAccessorNodeChildren> {
}

export const createAttributeAccessorNode = (
    target: TwingExpressionNode,
    attribute: TwingExpressionNode,
    methodArguments: TwingExpressionNode,
    type: TwingAttributeAccessorCallType,
    line: number,
    column: number
): TwingAttributeAccessorNode => {
    const baseNode = createBaseExpressionNode("attribute_accessor", {
        isOptimizable: true,
        type,
        shouldTestExistence: false
    }, {
        target,
        attribute,
        arguments: methodArguments
    }, line, column);

    const attributeAccessorNode: TwingAttributeAccessorNode = {
        ...baseNode,
        execute: (executionContext) => {
            const {template, sandboxed, isStrictVariables} = executionContext;
            const {target, attribute, arguments: methodArguments} = attributeAccessorNode.children;
            const {type, shouldIgnoreStrictCheck, shouldTestExistence} = attributeAccessorNode.attributes;

            return Promise.all([
                target.execute(executionContext),
                attribute.execute(executionContext),
                methodArguments.execute(executionContext)
            ]).then(([target, attribute, methodArguments]) => {
                const traceableGetAttribute = getTraceableMethod(getAttribute, attributeAccessorNode.line, attributeAccessorNode.column, template.name);

                return traceableGetAttribute(
                    template,
                    target,
                    attribute,
                    methodArguments,
                    type,
                    shouldTestExistence,
                    shouldIgnoreStrictCheck || null,
                    sandboxed,
                    isStrictVariables
                )
            })
        }
    };

    return attributeAccessorNode;
};

export const cloneGetAttributeNode = (
    attributeAccessorNode: TwingAttributeAccessorNode
): TwingAttributeAccessorNode => {
    const {children, attributes, line, column} = attributeAccessorNode;
    const {arguments: methodArguments, attribute, target} = children;
    const {type} = attributes;

    return createAttributeAccessorNode(
        target,
        attribute,
        methodArguments,
        type,
        line,
        column
    );
};

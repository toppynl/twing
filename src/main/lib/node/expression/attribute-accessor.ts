import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode, TwingExpressionNode
} from "../expression";

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
    return createBaseExpressionNode("attribute_accessor", {
        isOptimizable: true,
        type,
        shouldTestExistence: false
    }, {
        target,
        attribute,
        arguments: methodArguments
    }, line, column);
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

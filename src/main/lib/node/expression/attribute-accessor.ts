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
    isNullSafe: boolean;
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
    column: number,
    isNullSafe: boolean = false
): TwingAttributeAccessorNode => {
    return createBaseExpressionNode("attribute_accessor", {
        isOptimizable: true,
        type,
        shouldTestExistence: false,
        isNullSafe
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
    const {type, isNullSafe} = attributes;

    return createAttributeAccessorNode(
        target,
        attribute,
        methodArguments,
        type,
        line,
        column,
        isNullSafe
    );
};

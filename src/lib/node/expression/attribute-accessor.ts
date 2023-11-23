import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {getAttribute} from "../../helpers/get-attribute";

export type TwingGetAttributeCallType = "any" | "array" | "method";

export type TwingAttributeAccessorNodeAttributes = TwingBaseExpressionNodeAttributes & {
    isOptimizable: boolean;
    type: TwingGetAttributeCallType;
    shouldIgnoreStrictCheck?: boolean;
    shouldTestExistence: boolean;
};

export type TwingAttributeAccessorNodeChildren = {
    target: TwingBaseExpressionNode;
    attribute: TwingBaseExpressionNode;
    arguments: TwingBaseExpressionNode;
};

export interface TwingAttributeAccessorNode extends TwingBaseExpressionNode<"get_attribute", TwingAttributeAccessorNodeAttributes, TwingAttributeAccessorNodeChildren> {
}

export const createAttributeAccessorNode = (
    target: TwingBaseExpressionNode,
    attribute: TwingBaseExpressionNode,
    methodArguments: TwingBaseExpressionNode,
    type: TwingGetAttributeCallType,
    line: number,
    column: number
): TwingAttributeAccessorNode => {
    const baseNode = createBaseExpressionNode("get_attribute", {
        isOptimizable: true,
        type,
        shouldTestExistence: false
    }, {
        target,
        attribute,
        arguments: methodArguments
    }, line, column);

    const node: TwingAttributeAccessorNode = {
        ...baseNode,
        execute: (...args) => {
            const [template] = args;
            const {target, attribute, arguments: methodArguments} = node.children;
            const {type, shouldIgnoreStrictCheck, shouldTestExistence} = node.attributes;

            const {environment} = template;

            return Promise.all([
                target.execute(...args),
                attribute.execute(...args),
                methodArguments.execute(...args)
            ]).then(([target, attribute, methodArguments]) => {
                const traceableGetAttribute = template.getTraceableMethod(getAttribute, node.line, node.column, template.templateName);
                
                return traceableGetAttribute(
                    environment,
                    target,
                    attribute,
                    methodArguments,
                    type,
                    shouldTestExistence,
                    shouldIgnoreStrictCheck || null
                )
            })
        }
    };

    return node;
};

export const cloneGetAttributeNode = (
    node: TwingAttributeAccessorNode
): TwingAttributeAccessorNode => {
    const {children, attributes, line, column} = node;
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

import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";

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
        compile: (compiler) => {
            const {target, attribute, arguments: methodArguments} = node.children;
            const {type, shouldIgnoreStrictCheck, shouldTestExistence} = node.attributes;

            compiler
                .write(`await template.getTraceableMethod(runtime.getAttribute, ${node.line}, template.source)(`).write('\n')
                .write('runtime,').write('\n');
            
            compiler
                .subCompile(target)
                .write(',').write('\n')
                .subCompile(attribute).write(',').write('\n')
                .subCompile(methodArguments).write(',').write('\n')
                .render(type).write(',').write('\n')
                .render(shouldTestExistence).write(',').write('\n')
                .render(shouldIgnoreStrictCheck || null).write('\n')
                .write(')');
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

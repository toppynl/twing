import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {TwingArrayNode} from "./array";
import {getKeyValuePairs} from "./array";
import {TwingBaseNode} from "../../node";
import {TwingTemplate} from "../../template";

export const methodCallNodeType = "method_call";

export type TwingMethodCallNodeAttributes = TwingBaseExpressionNodeAttributes & {
    methodName: string;
    shouldTestExistence: boolean;
};

type NodeWithName = TwingBaseNode<any, {
    name: string;
}>;

export interface TwingMethodCallNode extends TwingBaseExpressionNode<typeof methodCallNodeType, TwingMethodCallNodeAttributes, {
    operand: NodeWithName;
    arguments: TwingArrayNode;
}> {
}

export const createMethodCallNode = (
    operand: NodeWithName,
    methodName: string,
    methodArguments: TwingArrayNode,
    line: number,
    column: number
): TwingMethodCallNode => {
    const baseNode = createBaseExpressionNode(methodCallNodeType, {
        methodName,
        shouldTestExistence: false
    }, {
        operand,
        arguments: methodArguments
    }, line, column);

    const node: TwingMethodCallNode = {
        ...baseNode,
        execute: async (...args) => {
            const [template, context, outputBuffer, , aliases, sourceMapRuntime] = args;
            const {methodName, shouldTestExistence} = baseNode.attributes;
            const {operand, arguments: methodArguments} = baseNode.children;
            const {templateName} = template;

            if (shouldTestExistence) {
                return (aliases.get(operand.attributes.name) as TwingTemplate).hasMacro(methodName);
            } else {
                const keyValuePairs = getKeyValuePairs(methodArguments);

                const macroArguments: Array<any> = [];

                for (const {value: valueNode} of keyValuePairs) {
                    const value = await valueNode.execute(...args);

                    macroArguments.push(value);
                }

                return template.callMacro(
                    aliases.get(operand.attributes.name) as TwingTemplate,
                    methodName,
                    outputBuffer,
                    macroArguments,
                    node.line,
                    node.column,
                    context,
                    templateName,
                    sourceMapRuntime
                );
            }
        }
    };

    return node;
};

export const cloneMethodCallNode = (
    node: TwingMethodCallNode
): TwingMethodCallNode => {
    return createMethodCallNode(
        node.children.operand,
        node.attributes.methodName,
        node.children.arguments,
        node.line,
        node.column
    );
};

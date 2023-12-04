import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {TwingArrayNode} from "./array";
import {getKeyValuePairs} from "./array";
import {TwingBaseNode} from "../../node";
import {TwingTemplateMacroHandler, TwingTemplate} from "../../template";
import {createRuntimeError} from "../../error/runtime";

export type TwingMethodCallNodeAttributes = TwingBaseExpressionNodeAttributes & {
    methodName: string;
    shouldTestExistence: boolean;
};

export interface TwingMethodCallNode extends TwingBaseExpressionNode<"method_call", TwingMethodCallNodeAttributes, {
    operand: TwingBaseNode<any, {
        name: string;
    }>;
    arguments: TwingArrayNode;
}> {
}

export const createMethodCallNode = (
    operand: TwingBaseNode<any, {
        name: string;
    }>,
    methodName: string,
    methodArguments: TwingArrayNode,
    line: number,
    column: number
): TwingMethodCallNode => {
    const baseNode = createBaseExpressionNode("method_call", {
        methodName,
        shouldTestExistence: false
    }, {
        operand,
        arguments: methodArguments
    }, line, column);

    const methodCallNode: TwingMethodCallNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {template, context, outputBuffer, aliases, sandboxed, sourceMapRuntime} = executionContext;
            const {methodName, shouldTestExistence} = baseNode.attributes;
            const {operand, arguments: methodArguments} = baseNode.children;
            
            if (shouldTestExistence) {
                return (aliases.get(operand.attributes.name) as TwingTemplate).hasMacro(methodName);
            } else {
                const keyValuePairs = getKeyValuePairs(methodArguments);

                const macroArguments: Array<any> = [];

                for (const {value: valueNode} of keyValuePairs) {
                    const value = await valueNode.execute(executionContext);

                    macroArguments.push(value);
                }
                
                // by nature, the alias exists - the parser only creates a method call node when the name _is_ an alias.
                const macroTemplate = aliases.get(operand.attributes.name)!;

                const getHandler = (template: TwingTemplate): Promise<TwingTemplateMacroHandler | null> => {
                    const macroHandler = template.macroHandlers.get(methodName);

                    if (macroHandler) {
                        return Promise.resolve(macroHandler);
                    } else {
                        return template.getParent(context, outputBuffer, sandboxed)
                            .then((parent) => {
                                if (parent) {
                                    return getHandler(parent);
                                } else {
                                    return null;
                                }
                            });
                    }
                };

                return getHandler(macroTemplate)
                    .then((handler) => {
                        if (handler) {
                            return handler(outputBuffer, sandboxed, sourceMapRuntime, ...macroArguments);
                        } else {
                            throw createRuntimeError(`Macro "${methodName}" is not defined in template "${macroTemplate.name}".`, methodCallNode, template.name);
                        }
                    });
            }
        }
    };

    return methodCallNode;
};

export const cloneMethodCallNode = (
    methodCallNode: TwingMethodCallNode
): TwingMethodCallNode => {
    return createMethodCallNode(
        methodCallNode.children.operand,
        methodCallNode.attributes.methodName,
        methodCallNode.children.arguments,
        methodCallNode.line,
        methodCallNode.column
    );
};

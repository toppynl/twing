import type {TwingNodeExecutor} from "../../node-executor";
import {TwingTemplate, TwingTemplateMacroHandler} from "../../template";
import {createRuntimeError} from "../../error/runtime";
import type {TwingMethodCallNode} from "../../node/expression/method-call";
import {getKeyValuePairs} from "../../helpers/get-key-value-pairs";

export const executeMethodCall: TwingNodeExecutor<TwingMethodCallNode> = async (node, executionContext) => {
    const {template, aliases, nodeExecutor: execute} = executionContext;
    const {methodName, shouldTestExistence} = node.attributes;
    const {operand, arguments: methodArguments} = node.children;

    if (shouldTestExistence) {
        return (aliases.get(operand.attributes.name) as TwingTemplate).hasMacro(methodName);
    } else {
        const keyValuePairs = getKeyValuePairs(methodArguments);

        const macroArguments: Array<any> = [];

        for (const {value: valueNode} of keyValuePairs) {
            const value = await execute(valueNode, executionContext);

            macroArguments.push(value);
        }

        // by nature, the alias exists - the parser only creates a method call node when the name _is_ an alias.
        const macroTemplate = aliases.get(operand.attributes.name)!;
        
        const getHandler = (template: TwingTemplate): Promise<TwingTemplateMacroHandler | null> => {
            const macroHandler = template.macroHandlers.get(methodName);

            if (macroHandler) {
                return Promise.resolve(macroHandler);
            } else {
                return template.getParent(executionContext)
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
                    return handler(executionContext, ...macroArguments);
                } else {
                    throw createRuntimeError(`Macro "${methodName}" is not defined in template "${macroTemplate.name}".`, node, template.name);
                }
            });
    }
};

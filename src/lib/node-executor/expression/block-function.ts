import type {TwingNodeExecutor} from "../../node-executor";
import type {TwingBlockFunctionNode} from "../../node/expression/block-function";
import {TwingTemplate} from "../../template";
import {getTraceableMethod} from "../../helpers/traceable-method";

export const executeBlockFunction: TwingNodeExecutor<TwingBlockFunctionNode> = async (node, executionContext) => {
    const {template, context, nodeExecutor: execute, outputBuffer, blocks, sandboxed, sourceMapRuntime} = executionContext;
    const {template: templateNode, name: blockNameNode} = node.children;

    const blockName = await execute(blockNameNode, executionContext);

    let resolveTemplate: Promise<TwingTemplate>;

    if (templateNode) {
        const templateName = await execute(templateNode, executionContext);

        const loadTemplate = getTraceableMethod(
            template.loadTemplate,
            templateNode.line,
            templateNode.column,
            template.name
        );

        resolveTemplate = loadTemplate(templateName);
    } else {
        resolveTemplate = Promise.resolve(template)
    }

    return resolveTemplate
        .then<Promise<boolean | string>>((executionContextOfTheBlock) => {
            if (node.attributes.shouldTestExistence) {
                const hasBlock = getTraceableMethod(executionContextOfTheBlock.hasBlock, node.line, node.column, template.name);

                return hasBlock(blockName, context.clone(), outputBuffer, blocks, sandboxed, execute);
            } else {
                const renderBlock = getTraceableMethod(executionContextOfTheBlock.renderBlock, node.line, node.column, template.name);

                if (templateNode) {
                    return renderBlock(blockName, context.clone(), outputBuffer, new Map(), false, sandboxed, execute, sourceMapRuntime);
                } else {
                    return renderBlock(blockName, context.clone(), outputBuffer, blocks, true, sandboxed, execute, sourceMapRuntime);
                }
            }
        });
};

import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import type {TwingBlockFunctionNode} from "../../node/expression/block-function";
import {TwingSynchronousTemplate, TwingTemplate} from "../../template";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../../helpers/traceable-method";

export const executeBlockFunction: TwingNodeExecutor<TwingBlockFunctionNode> = async (node, executionContext) => {
    const {
        template,
        context,
        nodeExecutor: execute,
        blocks,
        outputBuffer
    } = executionContext;
    const {template: templateNode, name: blockNameNode} = node.children;

    const blockName = await execute(blockNameNode, executionContext);

    let resolveTemplate: Promise<TwingTemplate>;

    if (templateNode) {
        const templateName = await execute(templateNode, executionContext);

        const loadTemplate = getTraceableMethod(
            template.loadTemplate,
            templateNode,
            template.source
        );

        resolveTemplate = loadTemplate(executionContext, templateName);
    }
    else {
        resolveTemplate = Promise.resolve(template)
    }

    return resolveTemplate
        .then<Promise<boolean | string>>((templateOfTheBlock) => {
            if (node.attributes.shouldTestExistence) {
                const hasBlock = getTraceableMethod(templateOfTheBlock.hasBlock, node, template.source);

                return hasBlock({
                    ...executionContext,
                    context: context.clone()
                }, blockName, blocks);
            }
            else {
                const displayBlock = getTraceableMethod(templateOfTheBlock.displayBlock, node, template.source);

                let useBlocks = templateNode === undefined;

                outputBuffer.start();

                return displayBlock({
                    ...executionContext,
                    context: context.clone()
                }, blockName, useBlocks).then<string>(() => {
                    return outputBuffer.getAndClean();
                });
            }
        });
};

export const executeSynchronousBlockFunction: TwingSynchronousNodeExecutor<TwingBlockFunctionNode> = (node, executionContext) => {
    const {
        template,
        context,
        nodeExecutor: execute,
        blocks,
        outputBuffer
    } = executionContext;
    const {template: templateNode, name: blockNameNode} = node.children;

    const blockName = execute(blockNameNode, executionContext);

    let templateOfTheBlock: TwingSynchronousTemplate;

    if (templateNode) {
        const templateName = execute(templateNode, executionContext);

        const loadTemplate = getSynchronousTraceableMethod(
            template.loadTemplate,
            templateNode,
            template.source
        );

        templateOfTheBlock = loadTemplate(executionContext, templateName);
    }
    else {
        templateOfTheBlock = template;
    }

    if (node.attributes.shouldTestExistence) {
        const hasBlock = getSynchronousTraceableMethod(templateOfTheBlock.hasBlock, node, template.source);

        return hasBlock({
            ...executionContext,
            context: new Map(context.entries())
        }, blockName, blocks);
    }
    else {
        const displayBlock = getSynchronousTraceableMethod(templateOfTheBlock.displayBlock, node, template.source);

        let useBlocks = templateNode === undefined;

        outputBuffer.start();

        displayBlock({
            ...executionContext,
            context: new Map(context.entries())
        }, blockName, useBlocks);
        
        return outputBuffer.getAndClean();
    }
};

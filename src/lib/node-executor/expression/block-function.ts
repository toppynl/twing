import type {TwingNodeExecutor} from "../../node-executor";
import type {TwingBlockFunctionNode} from "../../node/expression/block-function";
import {TwingTemplate} from "../../template";
import {getTraceableMethod} from "../../helpers/traceable-method";

export const executeBlockFunction: TwingNodeExecutor<TwingBlockFunctionNode> = async (node, executionContext) => {
    const {
        template,
        context,
        nodeExecutor: execute,
        blocks
    } = executionContext;
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

        resolveTemplate = loadTemplate(executionContext, templateName);
    } else {
        resolveTemplate = Promise.resolve(template)
    }

    return resolveTemplate
        .then<Promise<boolean | string>>((templateOfTheBlock) => {
            if (node.attributes.shouldTestExistence) {
                const hasBlock = getTraceableMethod(templateOfTheBlock.hasBlock, node.line, node.column, template.name);

                return hasBlock({
                    ...executionContext,
                    context: context.clone()
                }, blockName, blocks);
            } else {
                const renderBlock = getTraceableMethod(templateOfTheBlock.renderBlock, node.line, node.column, template.name);

                if (templateNode) {
                    return renderBlock({
                        ...executionContext,
                        context: context.clone()
                    }, blockName, false);
                } else {
                    return renderBlock({
                        ...executionContext,
                        context: context.clone()
                    }, blockName, true);
                }
            }
        });
};

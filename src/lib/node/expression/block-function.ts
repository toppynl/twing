import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {TwingBaseNode} from "../../node";
import {TwingTemplate} from "../../template";
import {getTraceableMethod} from "../../helpers/traceable-method";

export type TwingBlockFunctionNodeAttributes = TwingBaseExpressionNodeAttributes & {
    shouldTestExistence: boolean;
};

export type TwingBlockFunctionNodeChildren = {
    name: TwingBaseNode;
    template?: TwingBaseNode;
};

export interface TwingBlockFunctionNode extends TwingBaseExpressionNode<"block_function", TwingBlockFunctionNodeAttributes, TwingBlockFunctionNodeChildren> {
}

export const createBlockFunctionNode = (
    name: TwingBaseNode,
    template: TwingBaseNode | null,
    line: number,
    column: number,
    tag?: string
): TwingBlockFunctionNode => {
    const children: TwingBlockFunctionNodeChildren = {
        name
    };

    if (template) {
        children.template = template;
    }

    const baseNode = createBaseExpressionNode("block_function", {
        shouldTestExistence: false
    }, children, line, column, tag);

    const blockFunctionNode: TwingBlockFunctionNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {template, context, outputBuffer, blocks, sandboxed, sourceMapRuntime} = executionContext;
            const {template: templateNode, name: blockNameNode} = blockFunctionNode.children;

            const blockName = await blockNameNode.execute(executionContext);

            let resolveTemplate: Promise<TwingTemplate>;

            if (templateNode) {
                const templateName = await templateNode.execute(executionContext);

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
                    if (blockFunctionNode.attributes.shouldTestExistence) {
                        const hasBlock = getTraceableMethod(executionContextOfTheBlock.hasBlock, blockFunctionNode.line, blockFunctionNode.column, template.name);

                        return hasBlock(blockName, context.clone(), outputBuffer, blocks, sandboxed);
                    } else {
                        const renderBlock = getTraceableMethod(executionContextOfTheBlock.renderBlock, blockFunctionNode.line, blockFunctionNode.column, template.name);

                        if (templateNode) {
                            return renderBlock(blockName, context.clone(), outputBuffer, new Map(), false, sandboxed, sourceMapRuntime);
                        } else {
                            return renderBlock(blockName, context.clone(), outputBuffer, blocks, true, sandboxed, sourceMapRuntime);
                        }
                    }
                });
        }
    };

    return blockFunctionNode;
};

export const cloneBlockReferenceExpressionNode = (
    blockFunctionNode: TwingBlockFunctionNode
): TwingBlockFunctionNode => {
    return createBlockFunctionNode(
        blockFunctionNode.children.name,
        blockFunctionNode.children.template || null,
        blockFunctionNode.line,
        blockFunctionNode.column
    );
};

import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {TwingBaseNode} from "../../node";
import {TwingTemplate} from "../../template";

type TwingBlockFunctionNodeAttributes = TwingBaseExpressionNodeAttributes & {
    shouldTestExistence: boolean;
};

type TwingBlockFunctionNodeChildren = {
    name: TwingBaseNode;
    template?: TwingBaseNode;
};

export interface TwingBlockFunctionNode extends TwingBaseExpressionNode<"block_reference_expression", TwingBlockFunctionNodeAttributes, TwingBlockFunctionNodeChildren> {
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

    const baseNode = createBaseExpressionNode("block_reference_expression", {
        shouldTestExistence: false
    }, children, line, column, tag);

    const node: TwingBlockFunctionNode = {
        ...baseNode,
        execute: async (...args) => {
            const [template, context, outputBuffer, blocks, , sourceMapRuntime] = args;
            const {template: templateNode, name: blockNameNode} = node.children;

            const blockName = await blockNameNode.execute(...args);

            let resolveTemplate: Promise<TwingTemplate>;

            if (templateNode) {
                const templateName = await templateNode.execute(...args);

                resolveTemplate = template.loadTemplate(templateName, templateNode.line, templateNode.column);
            } else {
                resolveTemplate = Promise.resolve(template)
            }

            return resolveTemplate
                .then<Promise<boolean | string>>((executionContextOfTheBlock) => {
                    if (node.attributes.shouldTestExistence) {
                        const hasBlock = executionContextOfTheBlock.getTraceableMethod(executionContextOfTheBlock.hasBlock, node.line, node.column, template.templateName);

                        return hasBlock(blockName, context.clone(), outputBuffer, blocks);
                    } else {
                        const renderBlock = executionContextOfTheBlock.getTraceableMethod(executionContextOfTheBlock.renderBlock, node.line, node.column, template.templateName);
                        
                        if (templateNode) {
                            return renderBlock(blockName, context.clone(), outputBuffer, new Map(), false, sourceMapRuntime);
                        } else {
                            return renderBlock(blockName, context.clone(), outputBuffer, blocks, true, sourceMapRuntime);
                        }
                    }
                });
        }
    };

    return node;
};

export const cloneBlockReferenceExpressionNode = (
    node: TwingBlockFunctionNode
): TwingBlockFunctionNode => {
    return createBlockFunctionNode(
        node.children.name,
        node.children.template || null,
        node.line,
        node.column
    );
};

import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {TwingBaseNode} from "../../node";
import {TwingTemplate} from "../../template";
import {getTraceableMethod} from "../../helpers/traceable-method";

type TwingBlockFunctionNodeAttributes = TwingBaseExpressionNodeAttributes & {
    shouldTestExistence: boolean;
};

type TwingBlockFunctionNodeChildren = {
    name: TwingBaseNode;
    template?: TwingBaseNode;
};

export const blockFunctionNodeType = "block_function";

export interface TwingBlockFunctionNode extends TwingBaseExpressionNode<typeof blockFunctionNodeType, TwingBlockFunctionNodeAttributes, TwingBlockFunctionNodeChildren> {
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

    const baseNode = createBaseExpressionNode(blockFunctionNodeType, {
        shouldTestExistence: false
    }, children, line, column, tag);

    const node: TwingBlockFunctionNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {template, context, outputBuffer, blocks, sandboxed, sourceMapRuntime} = executionContext;
            const {template: templateNode, name: blockNameNode} = node.children;

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
                    if (node.attributes.shouldTestExistence) {
                        const hasBlock = getTraceableMethod(executionContextOfTheBlock.hasBlock, node.line, node.column, template.name);

                        return hasBlock(blockName, context.clone(), outputBuffer, blocks, sandboxed);
                    } else {
                        const renderBlock = getTraceableMethod(executionContextOfTheBlock.renderBlock, node.line, node.column, template.name);

                        if (templateNode) {
                            return renderBlock(blockName, context.clone(), outputBuffer, new Map(), false, sandboxed, sourceMapRuntime);
                        } else {
                            return renderBlock(blockName, context.clone(), outputBuffer, blocks, true, sandboxed, sourceMapRuntime);
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

import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import type {TwingBlockReferenceNode} from "../node/block-reference";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../helpers/traceable-method";

export const executeBlockReferenceNode: TwingNodeExecutor<TwingBlockReferenceNode> = (node, executionContext) => {
    const {
        template,
        context
    } = executionContext;
    const {name} = node.attributes;

    const displayBlock = getTraceableMethod(template.displayBlock, node, template.source);

    return displayBlock(
        {
            ...executionContext,
            context: context.clone()
        },
        name,
        true,
    );
};

export const executeBlockReferenceNodeSynchronously: TwingSynchronousNodeExecutor<TwingBlockReferenceNode> = (node, executionContext) => {
    const {
        template,
        context
    } = executionContext;
    const {name} = node.attributes;

    const displayBlock = getSynchronousTraceableMethod(template.displayBlock, node, template.source);

    return displayBlock(
        {
            ...executionContext,
            // todo: was context: context.clone()
            // context: context.clone()
            context: new Map(context.entries())
        },
        name,
        true,
    );
};

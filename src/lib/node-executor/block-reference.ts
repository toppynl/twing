import type {TwingNodeExecutor} from "../node-executor";
import type {TwingBlockReferenceNode} from "../node/block-reference";
import {getTraceableMethod} from "../helpers/traceable-method";

export const executeBlockReferenceNode: TwingNodeExecutor<TwingBlockReferenceNode> = (node, executionContext) => {
    const {
        template,
        context
    } = executionContext;
    const {name} = node.attributes;

    const displayBlock = getTraceableMethod(template.displayBlock, node.line, node.column, template.name);

    return displayBlock(
        {
            ...executionContext,
            context: context.clone()
        },
        name,
        true,
    );
};

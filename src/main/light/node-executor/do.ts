import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingDoNode} from "../node/do";

export const executeDoNode: TwingNodeExecutor<TwingDoNode> = (node, executionContext) => {
    return executionContext.nodeExecutor(node.children.body, executionContext);
};

export const executeDoNodeSynchronously: TwingSynchronousNodeExecutor<TwingDoNode> = (node, executionContext) => {
    return executionContext.nodeExecutor(node.children.body, executionContext);
};

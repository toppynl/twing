import {TwingNodeExecutor} from "../node-executor";
import {TwingDoNode} from "../node/do";

export const executeDoNode: TwingNodeExecutor<TwingDoNode> = (node, executionContext) => {
    return executionContext.nodeExecutor(node.children.body, executionContext);
};

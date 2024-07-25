import {TwingNodeExecutor} from "../node-executor";
import {TwingSandboxNode} from "../node/sandbox";

export const executeSandboxNode: TwingNodeExecutor<TwingSandboxNode> = (node, executionContext) => {
    const {body} = node.children;
    const {nodeExecutor: execute} = executionContext;

    return execute(body, {
        ...executionContext,
        sandboxed: true
    });
};

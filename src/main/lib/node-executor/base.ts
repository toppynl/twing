import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";

export const executeBaseNode: TwingNodeExecutor = async (node, executionContext) => {
    const output: Array<any> = [];
    const {nodeExecutor: execute} = executionContext;

    for (const [, child] of Object.entries(node.children)) {
        output.push(await execute(child, executionContext));
    }

    return output;
};

export const executeBaseNodeSynchronously: TwingSynchronousNodeExecutor = (node, executionContext) => {
    const output: Array<any> = [];
    const {nodeExecutor: execute} = executionContext;

    for (const [, child] of Object.entries(node.children)) {
        output.push(execute(child, executionContext));
    }

    return output;
};

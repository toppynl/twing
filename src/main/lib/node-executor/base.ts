import type {TwingNodeExecutor} from "../node-executor";

export const executeBaseNode: TwingNodeExecutor = async (node, executionContext) => {
    const output: Array<any> = [];
    const {nodeExecutor: execute} = executionContext;

    for (const [, child] of Object.entries(node.children)) {
        output.push(await execute(child, executionContext));
    }

    return output;
};

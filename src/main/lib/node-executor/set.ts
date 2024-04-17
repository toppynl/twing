import {TwingNodeExecutor} from "../node-executor";
import {TwingSetNode} from "../node/set";

export const executeSetNode: TwingNodeExecutor<TwingSetNode> = async (node, executionContext) => {
    const {context, nodeExecutor: execute, outputBuffer} = executionContext;
    const {names: namesNode, values: valuesNode} = node.children;
    const {captures} = node.attributes;

    const names: Array<string> = await execute(namesNode, executionContext);

    if (captures) {
        outputBuffer.start();

        await execute(valuesNode, executionContext);

        const value = outputBuffer.getAndClean();

        for (const name of names) {
            context.set(name, value);
        }
    } else {
        const values: Array<any> = await execute(valuesNode, executionContext);

        let index = 0;

        for (const name of names) {
            const value = values[index];

            context.set(name, value);

            index++;
        }
    }
};

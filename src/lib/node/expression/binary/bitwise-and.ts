import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingBitwiseAndNode extends TwingBaseBinaryNode<"bitwise_and"> {
}

export const createBitwiseAndNode = createBinaryNodeFactory<TwingBitwiseAndNode>("bitwise_and", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) & await right.execute(executionContext);
    }
});

import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export const bitwiseAndNodeType = "bitwise_and";

export interface TwingBitwiseAndNode extends TwingBaseBinaryNode<typeof bitwiseAndNodeType> {
}

export const createBitwiseAndNode = createBinaryNodeFactory<TwingBitwiseAndNode>(bitwiseAndNodeType, {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) & await right.execute(executionContext);
    }
});

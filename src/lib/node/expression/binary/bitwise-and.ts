import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export const bitwiseAndNodeType = "bitwise_and";

export interface TwingBitwiseAndNode extends TwingBaseBinaryNode<typeof bitwiseAndNodeType> {
}

export const createBitwiseAndNode = createBinaryNodeFactory<TwingBitwiseAndNode>(bitwiseAndNodeType, {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) & await right.execute(...args);
    }
});

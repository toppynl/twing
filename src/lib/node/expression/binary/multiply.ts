import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingMultiplyNode extends TwingBaseBinaryNode<"mul"> {
}

export const createMultiplyNode = createBinaryNodeFactory<TwingMultiplyNode>("mul", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) * await right.execute(...args);
    }
});

import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsGreaterThanNode extends TwingBaseBinaryNode<"greater"> {
}

export const createIsGreaterThanNode = createBinaryNodeFactory<TwingIsGreaterThanNode>("greater", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) > await right.execute(...args);
    }
});

import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanNode extends TwingBaseBinaryNode<"less"> {
}

export const createIsLessThanNode = createBinaryNodeFactory<TwingIsLessThanNode>("less", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) < await right.execute(...args);
    }
});

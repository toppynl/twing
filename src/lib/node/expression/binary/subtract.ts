import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingSubtractNode extends TwingBaseBinaryNode<"sub"> {
}

export const createSubtractNode = createBinaryNodeFactory<TwingSubtractNode>("sub", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) - await right.execute(...args);
    }
});

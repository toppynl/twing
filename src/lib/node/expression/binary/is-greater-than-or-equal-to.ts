import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsGreaterThanOrEqualToNode extends TwingBaseBinaryNode<"greater_equal"> {
}

export const createIsGreaterThanOrEqualToNode = createBinaryNodeFactory<TwingIsGreaterThanOrEqualToNode>("greater_equal", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) >= await right.execute(...args);
    }
});

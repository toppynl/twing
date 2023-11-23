import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanOrEqualToNode extends TwingBaseBinaryNode<"less_equal"> {
}

export const createIsLessThanOrEqualToNode = createBinaryNodeFactory<TwingIsLessThanOrEqualToNode>("less_equal", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) <= await right.execute(...args);
    }
});

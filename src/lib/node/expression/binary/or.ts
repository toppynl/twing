import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingOrNode extends TwingBaseBinaryNode<"or"> {
}

export const createOrNode = createBinaryNodeFactory<TwingOrNode>("or", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return !!(await left.execute(...args) || await right.execute(...args));
    }
});

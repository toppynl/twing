import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const bitwiseOrNodeType = "bitwise_or";

export interface TwingBitwiseOrNode extends TwingBaseBinaryNode<typeof bitwiseOrNodeType> {
}

export const createBitwiseOrNode = createBinaryNodeFactory<TwingBitwiseOrNode>(bitwiseOrNodeType, {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) | await right.execute(...args);
    }
});

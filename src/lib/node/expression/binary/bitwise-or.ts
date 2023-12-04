import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const bitwiseOrNodeType = "bitwise_or";

export interface TwingBitwiseOrNode extends TwingBaseBinaryNode<typeof bitwiseOrNodeType> {
}

export const createBitwiseOrNode = createBinaryNodeFactory<TwingBitwiseOrNode>(bitwiseOrNodeType, {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) | await right.execute(executionContext);
    }
});

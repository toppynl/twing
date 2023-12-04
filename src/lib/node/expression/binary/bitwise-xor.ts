import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const bitwiseXorNodeType = "bitwise_xor";

export interface TwingBitwiseXorNode extends TwingBaseBinaryNode<typeof bitwiseXorNodeType> {
}

export const createBitwiseXorNode = createBinaryNodeFactory<TwingBitwiseXorNode>(bitwiseXorNodeType, {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) ^ await right.execute(executionContext);
    }
});

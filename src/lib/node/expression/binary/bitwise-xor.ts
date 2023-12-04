import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingBitwiseXorNode extends TwingBaseBinaryNode<"bitwise_xor"> {
}

export const createBitwiseXorNode = createBinaryNodeFactory<TwingBitwiseXorNode>("bitwise_xor", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) ^ await right.execute(executionContext);
    }
});

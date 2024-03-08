import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingBitwiseXorNode extends TwingBaseBinaryNode<"bitwise_xor"> {
}

export const createBitwiseXorNode = createBinaryNodeFactory<TwingBitwiseXorNode>("bitwise_xor");

import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const bitwiseXorNodeType = "bitwise_xor";

export interface TwingBitwiseXorNode extends TwingBaseBinaryNode<typeof bitwiseXorNodeType> {
}

export const createBitwiseXorNode = createBinaryNodeFactory<TwingBitwiseXorNode>(bitwiseXorNodeType, '^');

import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const bitwiseOrNodeType = "bitwise_or";

export interface TwingBitwiseOrNode extends TwingBaseBinaryNode<typeof bitwiseOrNodeType> {
}

export const createBitwiseOrNode = createBinaryNodeFactory<TwingBitwiseOrNode>(bitwiseOrNodeType, '|');

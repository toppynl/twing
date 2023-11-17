import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export const bitwiseAndNodeType = "bitwise_and";

export interface TwingBitwiseAndNode extends TwingBaseBinaryNode<typeof bitwiseAndNodeType> {
}

export const createBitwiseAndNode = createBinaryNodeFactory<TwingBitwiseAndNode>(bitwiseAndNodeType, '&');

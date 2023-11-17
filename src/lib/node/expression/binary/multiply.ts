import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingMultiplyNode extends TwingBaseBinaryNode<"mul"> {
}

export const createMultiplyNode = createBinaryNodeFactory<TwingMultiplyNode>("mul", '*');

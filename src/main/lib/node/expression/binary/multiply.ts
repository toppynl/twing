import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingMultiplyNode extends TwingBaseBinaryNode<"multiply"> {
}

export const createMultiplyNode = createBinaryNodeFactory<TwingMultiplyNode>("multiply");

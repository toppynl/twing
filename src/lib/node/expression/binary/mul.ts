import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface MultiplyNode extends BaseBinaryNode<"mul"> {
}

export const createMultiplyNode = createBinaryNodeFactory<MultiplyNode>("mul", '*');

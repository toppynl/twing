import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface LessThanNode extends BaseBinaryNode<"less"> {
}

export const createLessThanNode = createBinaryNodeFactory<LessThanNode>("less", '<');

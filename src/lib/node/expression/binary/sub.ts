import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface SubtractNode extends BaseBinaryNode<"sub"> {
}

export const createSubtractNode = createBinaryNodeFactory<SubtractNode>("sub", '-');

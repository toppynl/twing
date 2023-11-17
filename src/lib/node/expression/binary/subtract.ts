import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingSubtractNode extends TwingBaseBinaryNode<"sub"> {
}

export const createSubtractNode = createBinaryNodeFactory<TwingSubtractNode>("sub", '-');

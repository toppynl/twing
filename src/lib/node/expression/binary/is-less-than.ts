import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanNode extends TwingBaseBinaryNode<"less"> {
}

export const createIsLessThanNode = createBinaryNodeFactory<TwingIsLessThanNode>("less", '<');
